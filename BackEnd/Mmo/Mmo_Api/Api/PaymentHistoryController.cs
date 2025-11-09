using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelResponse;
using Microsoft.AspNetCore.Mvc;

namespace Mmo_Api.Api;

[Route("api/payment-history")]
[ApiController]
public class PaymentHistoryController : ControllerBase
{
    private readonly IPaymentHistoryServices _paymentHistoryServices;
    private readonly IPaymenttransactionServices _paymentTransactionServices;

    public PaymentHistoryController(IPaymentHistoryServices paymentHistoryServices, IPaymenttransactionServices paymentTransactionServices)
    {
        _paymentHistoryServices = paymentHistoryServices;
        _paymentTransactionServices = paymentTransactionServices;
    }

    [HttpGet("{userId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(PaymentHistorySummary), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaymentHistorySummary>> GetPaymentHistory(int userId, 
        [FromQuery] DateTime? startDate = null, 
        [FromQuery] DateTime? endDate = null, 
        [FromQuery] string? transactionType = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5)
    {
        try
        {
            var paymentHistory = await _paymentHistoryServices.GetPaymentHistoryByUserIdAsync(userId, startDate, endDate, transactionType, page, pageSize);
            return Ok(paymentHistory);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("process-transaction/{transactionId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> ProcessSuccessfulTransaction(int transactionId)
    {
        try
        {
            var result = await _paymentTransactionServices.ProcessSuccessfulTransactionAsync(transactionId);
            if (result)
            {
                return Ok(new { message = "Transaction processed successfully and balance updated" });
            }
            return BadRequest("Transaction could not be processed");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
