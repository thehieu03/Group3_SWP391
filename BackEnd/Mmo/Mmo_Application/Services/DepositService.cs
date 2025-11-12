using Mmo_Application.Services.Interface;
using Mmo_Domain.Models;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;
using Microsoft.Extensions.Logging;

namespace Mmo_Application.Services;

public class DepositService : IDepositService
{
    private readonly IPaymenttransactionServices _paymentTransactionServices;
    private readonly IVietQRService _vietQRService;
    private readonly ISePayService _sePayService;
    private readonly ILogger<DepositService> _logger;

    public DepositService(
        IPaymenttransactionServices paymentTransactionServices,
        IVietQRService vietQRService,
        ISePayService sePayService,
        ILogger<DepositService> logger)
    {
        _paymentTransactionServices = paymentTransactionServices;
        _vietQRService = vietQRService;
        _sePayService = sePayService;
        _logger = logger;
    }

    public async Task<DepositResponse> CreateDepositAsync(int userId, CreateDepositRequest request)
    {
        if (request.Amount <= 0)
        {
            throw new ArgumentException("Amount must be greater than 0", nameof(request));
        }

        // ref code 
        var referenceCode = GenerateReferenceCode(userId);

        var transaction = new Paymenttransaction
        {
            UserId = userId,
            Type = "DEPOSIT",
            Amount = request.Amount,
            PaymentDescription = $"Nạp tiền {request.Amount:N0} VNĐ",
            Status = "PENDING",
            ReferenceCode = referenceCode,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        await _paymentTransactionServices.AddAsync(transaction);

        // QR code URL
        var qrCodeUrl = _vietQRService.GenerateQRCodeUrl(request.Amount, referenceCode);

        return new DepositResponse
        {
            TransactionId = transaction.Id,
            Amount = transaction.Amount,
            ReferenceCode = referenceCode,
            QrCodeUrl = qrCodeUrl,
            Status = transaction.Status ?? "PENDING",
            CreatedAt = transaction.CreatedAt
        };
    }

    public async Task<DepositStatusResponse?> GetDepositStatusAsync(int userId, int transactionId)
    {
        var transaction = await _paymentTransactionServices.GetByIdAsync(transactionId);
        
        if (transaction == null)
        {
            return null;
        }

        if (transaction.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have permission to view this transaction");
        }

        return new DepositStatusResponse
        {
            TransactionId = transaction.Id,
            Status = transaction.Status ?? "PENDING",
            Amount = transaction.Amount,
            ReferenceCode = transaction.ReferenceCode,
            CreatedAt = transaction.CreatedAt,
            UpdatedAt = transaction.UpdatedAt
        };
    }

    public async Task<VerifyDepositResponse> VerifyDepositAsync(int userId, int transactionId)
    {
        var transaction = await _paymentTransactionServices.GetByIdAsync(transactionId);
        
        if (transaction == null)
        {
            throw new KeyNotFoundException("Transaction not found");
        }

        if (transaction.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have permission to verify this transaction");
        }

        if (transaction.Status == "SUCCESS")
        {
            return new VerifyDepositResponse
            {
                TransactionId = transaction.Id,
                Status = "SUCCESS",
                Message = "Transaction is already verified",
                Processed = false
            };
        }

        if (string.IsNullOrEmpty(transaction.ReferenceCode) || !transaction.CreatedAt.HasValue)
        {
            throw new InvalidOperationException("Transaction is missing required information");
        }

        // sePay verify
        var isVerified = await _sePayService.VerifyTransactionAsync(
            transaction.ReferenceCode, 
            transaction.Amount, 
            transaction.CreatedAt.Value);

        if (isVerified)
        {
            transaction.Status = "SUCCESS";
            transaction.UpdatedAt = DateTime.Now;
            await _paymentTransactionServices.UpdateAsync(transaction);

            // update bal 
            var processResult = await _paymentTransactionServices.ProcessSuccessfulTransactionAsync(transactionId);

            return new VerifyDepositResponse
            {
                TransactionId = transaction.Id,
                Status = "SUCCESS",
                Message = "Transaction verified successfully",
                Processed = processResult
            };
        }
        else
        {
            return new VerifyDepositResponse
            {
                TransactionId = transaction.Id,
                Status = transaction.Status ?? "PENDING",
                Message = "Transaction not found in SePay. Please check if payment was completed.",
                Processed = false
            };
        }
    }
    
    private string GenerateReferenceCode(int userId)
    {
        var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
        return $"DEP{userId}{timestamp}";
    }
}

