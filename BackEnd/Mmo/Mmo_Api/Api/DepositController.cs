using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;
using System.Security.Claims;

namespace Mmo_Api.Api;

[Route("api/deposit")]
[ApiController]
[Authorize]
public class DepositController : ControllerBase
{
    private readonly IDepositService _depositService;
    private readonly ILogger<DepositController> _logger;

    public DepositController(
        IDepositService depositService,
        ILogger<DepositController> logger)
    {
        _depositService = depositService;
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
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<DepositResponse>> CreateDeposit([FromBody] CreateDepositRequest request)
    {
        try
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                return Unauthorized("User ID not found in token");
            }

            var response = await _depositService.CreateDepositAsync(userId.Value, request);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid deposit request");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating deposit");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("status/{transactionId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<DepositStatusResponse>> GetDepositStatus(int transactionId)
    {
        try
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                return Unauthorized("User ID not found in token");
            }

            var response = await _depositService.GetDepositStatusAsync(userId.Value, transactionId);
            
            if (response == null)
            {
                return NotFound("Transaction not found");
            }

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to deposit status");
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting deposit status");
            return StatusCode(500, "Internal server error");
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
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<VerifyDepositResponse>> VerifyDeposit(int transactionId)
    {
        try
        {
            var userId = GetUserIdFromClaims();
            if (userId == null)
            {
                return Unauthorized("User ID not found in token");
            }

            var response = await _depositService.VerifyDepositAsync(userId.Value, transactionId);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Transaction not found");
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to verify deposit");
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation for verify deposit");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying deposit");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Helper method để lấy User ID từ JWT claims
    /// </summary>
    private int? GetUserIdFromClaims()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("id")?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        return userId;
    }
}

