using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mmo_Application.Services.Interface;
using Mmo_Domain.Models;
using System.Security.Claims;

namespace Mmo_Api.Api;

[Route("api/deposit")]
[ApiController]
[Authorize]
public class DepositController : ControllerBase
{
    private readonly IPaymenttransactionServices _paymentTransactionServices;
    private readonly IVietQRService _vietQRService;
    private readonly ISePayService _sePayService;
    private readonly ILogger<DepositController> _logger;

    public DepositController(
        IPaymenttransactionServices paymentTransactionServices,
        IVietQRService vietQRService,
        ISePayService sePayService,
        ILogger<DepositController> logger)
    {
        _paymentTransactionServices = paymentTransactionServices;
        _vietQRService = vietQRService;
        _sePayService = sePayService;
        _logger = logger;
    }

    /// <summary>
    /// Tạo giao dịch nạp tiền và trả về QR code để người dùng quét thanh toán
    /// Luồng: Tạo transaction PENDING -> Generate QR code với reference code -> Trả về cho frontend
    /// Background service sẽ tự động polling và cập nhật status khi phát hiện thanh toán từ SePay
    /// </summary>
    [HttpPost("create")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<DepositResponse>> CreateDeposit([FromBody] CreateDepositRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("id")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User ID not found in token");
            }

            if (request.Amount <= 0)
            {
                return BadRequest("Amount must be greater than 0");
            }

            // Generate unique reference code để match với giao dịch từ SePay sau này
            // Format: DEP{userId}{timestamp} - ví dụ: DEP12320240101123456
            var referenceCode = GenerateReferenceCode(userId);

            // Tạo transaction với status PENDING, sẽ được cập nhật thành SUCCESS bởi PaymentPollingService
            // khi phát hiện thanh toán từ SePay API
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

            // Generate QR code URL từ VietQR với reference code để user quét và thanh toán
            // Reference code sẽ được gửi trong nội dung chuyển khoản để match sau này
            var qrCodeUrl = _vietQRService.GenerateQRCodeUrl(request.Amount, referenceCode);

            var response = new DepositResponse
            {
                TransactionId = transaction.Id,
                Amount = transaction.Amount,
                ReferenceCode = referenceCode,
                QrCodeUrl = qrCodeUrl,
                Status = transaction.Status,
                CreatedAt = transaction.CreatedAt
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating deposit");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("status/{transactionId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DepositStatusResponse>> GetDepositStatus(int transactionId)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("id")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var transaction = await _paymentTransactionServices.GetByIdAsync(transactionId);
            
            if (transaction == null)
            {
                return NotFound("Transaction not found");
            }

            if (transaction.UserId != userId)
            {
                return Forbid("You don't have permission to view this transaction");
            }

            return Ok(new DepositStatusResponse
            {
                TransactionId = transaction.Id,
                Status = transaction.Status ?? "PENDING",
                Amount = transaction.Amount,
                ReferenceCode = transaction.ReferenceCode,
                CreatedAt = transaction.CreatedAt,
                UpdatedAt = transaction.UpdatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting deposit status");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Verify giao dịch thủ công bằng cách query SePay API để kiểm tra xem đã có thanh toán chưa
    /// Endpoint này cho phép user verify ngay lập tức thay vì đợi background service polling
    /// </summary>
    [HttpPost("verify/{transactionId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<VerifyDepositResponse>> VerifyDeposit(int transactionId)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("id")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var transaction = await _paymentTransactionServices.GetByIdAsync(transactionId);
            
            if (transaction == null)
            {
                return NotFound("Transaction not found");
            }

            if (transaction.UserId != userId)
            {
                return Forbid("You don't have permission to verify this transaction");
            }

            if (transaction.Status == "SUCCESS")
            {
                return BadRequest("Transaction is already verified");
            }

            if (string.IsNullOrEmpty(transaction.ReferenceCode) || !transaction.CreatedAt.HasValue)
            {
                return BadRequest("Transaction is missing required information");
            }

            // Query SePay API để tìm giao dịch có reference code và amount khớp
            // SePayService sẽ thử match bằng nhiều cách: exact reference, partial reference, hoặc transaction content
            var isVerified = await _sePayService.VerifyTransactionAsync(
                transaction.ReferenceCode, 
                transaction.Amount, 
                transaction.CreatedAt.Value);

            if (isVerified)
            {
                transaction.Status = "SUCCESS";
                transaction.UpdatedAt = DateTime.Now;
                await _paymentTransactionServices.UpdateAsync(transaction);

                // Cập nhật balance của user sau khi verify thành công
                var processResult = await _paymentTransactionServices.ProcessSuccessfulTransactionAsync(transactionId);

                return Ok(new VerifyDepositResponse
                {
                    TransactionId = transaction.Id,
                    Status = "SUCCESS",
                    Message = "Transaction verified successfully",
                    Processed = processResult
                });
            }
            else
            {
                return Ok(new VerifyDepositResponse
                {
                    TransactionId = transaction.Id,
                    Status = transaction.Status ?? "PENDING",
                    Message = "Transaction not found in SePay. Please check if payment was completed.",
                    Processed = false
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying deposit");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Generate unique reference code cho mỗi giao dịch nạp tiền
    /// Format: DEP{userId}{timestamp} - ví dụ: DEP12320240101123456
    /// Reference code này sẽ được gửi trong nội dung chuyển khoản để SePay match với transaction
    /// </summary>
    private string GenerateReferenceCode(int userId)
    {
        var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
        return $"DEP{userId}{timestamp}";
    }
}

public class CreateDepositRequest
{
    public decimal Amount { get; set; }
}

public class DepositResponse
{
    public int TransactionId { get; set; }
    public decimal Amount { get; set; }
    public string ReferenceCode { get; set; } = string.Empty;
    public string QrCodeUrl { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
}

public class DepositStatusResponse
{
    public int TransactionId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? ReferenceCode { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class VerifyDepositResponse
{
    public int TransactionId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool Processed { get; set; }
}

