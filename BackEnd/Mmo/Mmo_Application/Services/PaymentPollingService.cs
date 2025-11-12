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

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var paymentService = scope.ServiceProvider.GetRequiredService<IPaymenttransactionServices>();
                var sePayService = scope.ServiceProvider.GetRequiredService<ISePayService>();

                var pendingTransactions = await GetPendingTransactionsAsync(paymentService);
                var transactionsToVerify = new List<Paymenttransaction>();

                foreach (var transaction in pendingTransactions)
                {
                    // PENDING > 15m => CANCELLED
                    var expirationMinutes = _configuration.GetValue<int>("Payment:ExpirationMinutes", 15);
                    var expirationTime = transaction.CreatedAt?.AddMinutes(expirationMinutes) ?? DateTime.Now;

                    if (DateTime.Now > expirationTime)
                    {
                        await UpdateTransactionStatusAsync(paymentService, transaction.Id, "CANCELLED");
                        continue;
                    }

                    if (!string.IsNullOrEmpty(transaction.ReferenceCode) && transaction.CreatedAt.HasValue)
                        transactionsToVerify.Add(transaction);
                }

                if (transactionsToVerify.Any())
                    try
                    {
                        var oldestDate = transactionsToVerify.Min(t => t.CreatedAt!.Value).AddDays(-2).Date;
                        var newestDate = DateTime.Now.Date.AddDays(1);

                        var minDate = DateTime.Now.Date.AddDays(-7);
                        if (oldestDate > minDate) oldestDate = minDate;

                        var sePayTransactions = await sePayService.GetTransactionsAsync(oldestDate, newestDate);

                        foreach (var transaction in transactionsToVerify)
                        {
                            var matchedSePayTransaction = MatchTransaction(sePayTransactions, transaction);

                            if (matchedSePayTransaction != null)
                            {
                                // update status SUCCESS + payload 
                                await UpdateTransactionStatusAsync(paymentService, transaction.Id, "SUCCESS",
                                    matchedSePayTransaction);
                                // + balance
                                await paymentService.ProcessSuccessfulTransactionAsync(transaction.Id);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error fetching or matching SePay transactions");
                    }

                await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in payment polling service");
                await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
            }
    }

    //get PENDING deposit transactions từ database
    private async Task<List<Paymenttransaction>> GetPendingTransactionsAsync(IPaymenttransactionServices paymentService)
    {
        try
        {
            var allTransactions = await paymentService.GetAllAsync();

            var pendingTransactions = allTransactions
                .Where(t =>
                    t.Status != null && t.Status.Equals("PENDING", StringComparison.OrdinalIgnoreCase) &&
                    t.Type != null && t.Type.Equals("DEPOSIT", StringComparison.OrdinalIgnoreCase))
                .ToList();

            return pendingTransactions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending transactions");
            return new List<Paymenttransaction>();
        }
    }

    // update transaction status
    private async Task UpdateTransactionStatusAsync(IPaymenttransactionServices paymentService, int transactionId,
        string status, SePayTransaction? matchedSePayTransaction = null)
    {
        try
        {
            var transaction = await paymentService.GetByIdAsync(transactionId);
            if (transaction != null)
            {
                transaction.Status = status;
                transaction.UpdatedAt = DateTime.Now;

                if (matchedSePayTransaction != null)
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

                await paymentService.UpdateAsync(transaction);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating transaction {TransactionId} status", transactionId);
        }
    }


    private SePayTransaction? MatchTransaction(List<SePayTransaction> sePayTransactions, Paymenttransaction transaction)
    {
        if (string.IsNullOrEmpty(transaction.ReferenceCode) || !transaction.CreatedAt.HasValue) return null;

        // gen ref code
        var referenceVariations = GenerateReferenceVariations(transaction.ReferenceCode);

        foreach (var refVariation in referenceVariations)
        {
            var matchingByRef = sePayTransactions.FirstOrDefault(t =>
                !string.IsNullOrEmpty(t.ReferenceNumber) &&
                t.ReferenceNumber.Trim().Equals(refVariation.Trim(), StringComparison.OrdinalIgnoreCase) &&
                !string.IsNullOrEmpty(t.AmountIn) &&
                decimal.TryParse(t.AmountIn, out var amountIn1) &&
                Math.Abs(amountIn1 - transaction.Amount) < 0.01m);

            if (matchingByRef != null) return matchingByRef;
        }

        var partialRefs = new List<string>();
        if (transaction.ReferenceCode.Length > 15)
            partialRefs.Add(transaction.ReferenceCode.Substring(transaction.ReferenceCode.Length - 15));
        if (transaction.ReferenceCode.Length > 10)
            partialRefs.Add(transaction.ReferenceCode.Substring(transaction.ReferenceCode.Length - 10));
        if (transaction.ReferenceCode.Length > 8)
            partialRefs.Add(transaction.ReferenceCode.Substring(transaction.ReferenceCode.Length - 8));

        foreach (var partialRef in partialRefs)
        {
            var matchingByPartialRef = sePayTransactions.FirstOrDefault(t =>
                !string.IsNullOrEmpty(t.ReferenceNumber) &&
                (t.ReferenceNumber.Contains(partialRef) || partialRef.Contains(t.ReferenceNumber)) &&
                !string.IsNullOrEmpty(t.AmountIn) &&
                decimal.TryParse(t.AmountIn, out var amountIn2) &&
                Math.Abs(amountIn2 - transaction.Amount) < 0.01m);

            if (matchingByPartialRef != null) return matchingByPartialRef;
        }

        foreach (var refVariation in referenceVariations)
        {
            var matchingByContent = sePayTransactions.FirstOrDefault(t =>
                !string.IsNullOrEmpty(t.AmountIn) &&
                decimal.TryParse(t.AmountIn, out var amountIn3) &&
                Math.Abs(amountIn3 - transaction.Amount) < 0.01m &&
                !string.IsNullOrEmpty(t.TransactionContent) &&
                (t.TransactionContent.Contains(transaction.ReferenceCode, StringComparison.OrdinalIgnoreCase) ||
                 t.TransactionContent.Contains(refVariation, StringComparison.OrdinalIgnoreCase)));

            if (matchingByContent != null) return matchingByContent;
        }

        return null;
    }

    private List<string> GenerateReferenceVariations(string referenceCode)
    {
        var variations = new List<string> { referenceCode };

        if (referenceCode.StartsWith("DEP", StringComparison.OrdinalIgnoreCase))
            variations.Add(referenceCode.Substring(3));

        var numericPart = new string(referenceCode.Where(char.IsDigit).ToArray());
        if (!string.IsNullOrEmpty(numericPart) && numericPart != referenceCode) variations.Add(numericPart);

        if (referenceCode.Length > 3) variations.Add(referenceCode.Substring(3));

        if (referenceCode.Length >= 14) variations.Add(referenceCode.Substring(referenceCode.Length - 14));

        return variations.Distinct().ToList();
    }
}