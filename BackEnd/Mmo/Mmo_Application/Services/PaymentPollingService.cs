using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Mmo_Application.Services.Interface;
using Mmo_Domain.Models;

namespace Mmo_Application.Services;

public class PaymentPollingService : BackgroundService, IPaymentPollingService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PaymentPollingService> _logger;
    private readonly IConfiguration _configuration;

    public PaymentPollingService(
        IServiceProvider serviceProvider,
        ILogger<PaymentPollingService> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Background service chạy mỗi 5 giây để:
    /// 1. Lấy tất cả transaction PENDING type DEPOSIT
    /// 2. Hủy các transaction quá hạn (mặc định 15 phút)
    /// 3. Query SePay API để lấy danh sách giao dịch trong khoảng thời gian
    /// 4. Match transaction với SePay transaction bằng reference code và amount
    /// 5. Cập nhật status thành SUCCESS và cộng tiền vào balance nếu match thành công
    /// </summary>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var paymentService = scope.ServiceProvider.GetRequiredService<IPaymenttransactionServices>();
                var sePayService = scope.ServiceProvider.GetRequiredService<ISePayService>();

                var pendingTransactions = await GetPendingTransactionsAsync(paymentService);
                var transactionsToVerify = new List<Paymenttransaction>();
                
                foreach (var transaction in pendingTransactions)
                {
                    // Hủy transaction nếu quá thời gian expiration (mặc định 15 phút)
                    var expirationMinutes = _configuration.GetValue<int>("Payment:ExpirationMinutes", 15);
                    var expirationTime = transaction.CreatedAt?.AddMinutes(expirationMinutes) ?? DateTime.Now;

                    if (DateTime.Now > expirationTime)
                    {
                        await UpdateTransactionStatusAsync(paymentService, transaction.Id, "CANCELLED");
                        continue;
                    }

                    // Chỉ verify transaction có reference code và CreatedAt hợp lệ
                    if (!string.IsNullOrEmpty(transaction.ReferenceCode) && transaction.CreatedAt.HasValue)
                    {
                        transactionsToVerify.Add(transaction);
                    }
                }
                
                if (transactionsToVerify.Any())
                {
                    try
                    {
                        // Tính toán khoảng thời gian để query SePay API
                        // Lấy từ ngày cũ nhất - 2 ngày đến ngày mới nhất + 1 ngày để đảm bảo không bỏ sót
                        // Nhưng không query quá 7 ngày trước để tối ưu performance
                        var oldestDate = transactionsToVerify.Min(t => t.CreatedAt!.Value).AddDays(-2).Date;
                        var newestDate = DateTime.Now.Date.AddDays(1);
                        
                        var minDate = DateTime.Now.Date.AddDays(-7);
                        if (oldestDate > minDate)
                        {
                            oldestDate = minDate;
                        }
                        
                        // Query SePay API một lần cho tất cả transaction để tối ưu
                        var sePayTransactions = await sePayService.GetTransactionsAsync(oldestDate, newestDate);
                        
                        // Match từng transaction với SePay transactions
                        foreach (var transaction in transactionsToVerify)
                        {
                            var matchedSePayTransaction = MatchTransaction(sePayTransactions, transaction);
                            
                            if (matchedSePayTransaction != null)
                            {
                                // Cập nhật status và lưu raw payload từ SePay để audit
                                await UpdateTransactionStatusAsync(paymentService, transaction.Id, "SUCCESS", matchedSePayTransaction);
                                // Cộng tiền vào balance của user
                                await paymentService.ProcessSuccessfulTransactionAsync(transaction.Id);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error fetching or matching SePay transactions");
                    }
                }

                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in payment polling service");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }

    private async Task<List<Paymenttransaction>> GetPendingTransactionsAsync(IPaymenttransactionServices paymentService)
    {
        try
        {
            var allTransactions = await paymentService.GetAllAsync();
            
            var pendingTransactions = allTransactions
                .Where(t => 
                    (t.Status != null && t.Status.Equals("PENDING", StringComparison.OrdinalIgnoreCase)) &&
                    (t.Type != null && t.Type.Equals("DEPOSIT", StringComparison.OrdinalIgnoreCase)))
                .ToList();
            
            return pendingTransactions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending transactions");
            return new List<Paymenttransaction>();
        }
    }

    private async Task UpdateTransactionStatusAsync(IPaymenttransactionServices paymentService, int transactionId, string status, SePayTransaction? matchedSePayTransaction = null)
    {
        try
        {
            var transaction = await paymentService.GetByIdAsync(transactionId);
            if (transaction != null)
            {
                transaction.Status = status;
                transaction.UpdatedAt = DateTime.Now;
                
                if (matchedSePayTransaction != null)
                {
                    try
                    {
                        var rawPayloadJson = JsonSerializer.Serialize(matchedSePayTransaction, new JsonSerializerOptions
                        {
                            WriteIndented = false,
                            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                        });
                        transaction.RawPayload = rawPayloadJson;
                    }
                    catch
                    {
                    }
                }
                
                await paymentService.UpdateAsync(transaction);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating transaction {TransactionId} status", transactionId);
        }
    }

    /// <summary>
    /// Match transaction với SePay transaction bằng nhiều cách để tăng khả năng match thành công:
    /// 1. Match exact reference number (có thể có variations như bỏ prefix DEP, chỉ lấy số, etc.)
    /// 2. Match partial reference (8, 10, 15 ký tự cuối) - vì một số ngân hàng cắt ngắn reference
    /// 3. Match trong transaction content - vì reference có thể nằm trong nội dung chuyển khoản
    /// Tất cả các cách match đều phải kiểm tra amount khớp (sai số < 0.01 VNĐ)
    /// </summary>
    private SePayTransaction? MatchTransaction(List<Mmo_Application.Services.Interface.SePayTransaction> sePayTransactions, Paymenttransaction transaction)
    {
        if (string.IsNullOrEmpty(transaction.ReferenceCode) || !transaction.CreatedAt.HasValue)
        {
            return null;
        }

        // Generate các biến thể của reference code vì SePay có thể lưu dưới dạng khác
        // Ví dụ: DEP12320240101123456 -> 12320240101123456, 20240101123456, etc.
        var referenceVariations = GenerateReferenceVariations(transaction.ReferenceCode);

        // Cách 1: Match exact reference number với các variations
        foreach (var refVariation in referenceVariations)
        {
            var matchingByRef = sePayTransactions.FirstOrDefault(t => 
                !string.IsNullOrEmpty(t.ReferenceNumber) &&
                t.ReferenceNumber.Trim().Equals(refVariation.Trim(), StringComparison.OrdinalIgnoreCase) && 
                !string.IsNullOrEmpty(t.AmountIn) &&
                decimal.TryParse(t.AmountIn, out var amountIn1) &&
                Math.Abs(amountIn1 - transaction.Amount) < 0.01m);
            
            if (matchingByRef != null)
            {
                return matchingByRef;
            }
        }
        
        // Cách 2: Match partial reference (8, 10, 15 ký tự cuối)
        // Một số ngân hàng chỉ hiển thị một phần reference code trong SePay
        var partialRefs = new List<string>();
        if (transaction.ReferenceCode.Length > 15)
        {
            partialRefs.Add(transaction.ReferenceCode.Substring(transaction.ReferenceCode.Length - 15));
        }
        if (transaction.ReferenceCode.Length > 10)
        {
            partialRefs.Add(transaction.ReferenceCode.Substring(transaction.ReferenceCode.Length - 10));
        }
        if (transaction.ReferenceCode.Length > 8)
        {
            partialRefs.Add(transaction.ReferenceCode.Substring(transaction.ReferenceCode.Length - 8));
        }
        
        foreach (var partialRef in partialRefs)
        {
            var matchingByPartialRef = sePayTransactions.FirstOrDefault(t => 
                !string.IsNullOrEmpty(t.ReferenceNumber) &&
                (t.ReferenceNumber.Contains(partialRef) || partialRef.Contains(t.ReferenceNumber)) && 
                !string.IsNullOrEmpty(t.AmountIn) &&
                decimal.TryParse(t.AmountIn, out var amountIn2) &&
                Math.Abs(amountIn2 - transaction.Amount) < 0.01m);
            
            if (matchingByPartialRef != null)
            {
                return matchingByPartialRef;
            }
        }
        
        // Cách 3: Match trong transaction content (nội dung chuyển khoản)
        // Reference code có thể nằm trong phần nội dung thay vì reference number field
        foreach (var refVariation in referenceVariations)
        {
            var matchingByContent = sePayTransactions.FirstOrDefault(t => 
                !string.IsNullOrEmpty(t.AmountIn) &&
                decimal.TryParse(t.AmountIn, out var amountIn3) &&
                Math.Abs(amountIn3 - transaction.Amount) < 0.01m &&
                !string.IsNullOrEmpty(t.TransactionContent) &&
                (t.TransactionContent.Contains(transaction.ReferenceCode, StringComparison.OrdinalIgnoreCase) ||
                 t.TransactionContent.Contains(refVariation, StringComparison.OrdinalIgnoreCase)));
            
            if (matchingByContent != null)
            {
                return matchingByContent;
            }
        }
        
        
        return null;
    }

    /// <summary>
    /// Generate các biến thể của reference code để tăng khả năng match với SePay
    /// Vì SePay có thể lưu reference code dưới nhiều dạng khác nhau:
    /// - Bỏ prefix DEP: DEP12320240101123456 -> 12320240101123456
    /// - Chỉ lấy số: DEP12320240101123456 -> 12320240101123456
    /// - Lấy 14 ký tự cuối (thường là timestamp): ...20240101123456
    /// </summary>
    private List<string> GenerateReferenceVariations(string referenceCode)
    {
        var variations = new List<string> { referenceCode };
        
        // Bỏ prefix DEP nếu có (ví dụ: DEP12320240101123456 -> 12320240101123456)
        if (referenceCode.StartsWith("DEP", StringComparison.OrdinalIgnoreCase))
        {
            variations.Add(referenceCode.Substring(3));
        }
        
        // Chỉ lấy phần số (bỏ chữ cái) - một số ngân hàng chỉ lưu số
        var numericPart = new string(referenceCode.Where(char.IsDigit).ToArray());
        if (!string.IsNullOrEmpty(numericPart) && numericPart != referenceCode)
        {
            variations.Add(numericPart);
        }
        
        // Bỏ 3 ký tự đầu (thường là prefix)
        if (referenceCode.Length > 3)
        {
            variations.Add(referenceCode.Substring(3));
        }
        
        // Lấy 14 ký tự cuối (thường là timestamp yyyyMMddHHmmss)
        if (referenceCode.Length >= 14)
        {
            variations.Add(referenceCode.Substring(referenceCode.Length - 14));
        }
        
        return variations.Distinct().ToList();
    }
}

