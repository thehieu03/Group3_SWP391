using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelResponse;
using Microsoft.AspNetCore.Mvc;

namespace Mmo_Api.Api;

[Route("api/payment-history")]
[ApiController]
public class PaymentHistoryController : ControllerBase
{
    private readonly IPaymentHistoryServices _paymentHistoryServices;

    public PaymentHistoryController(IPaymentHistoryServices paymentHistoryServices)
    {
        _paymentHistoryServices = paymentHistoryServices;
    }

    [HttpGet("{userId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(PaymentHistorySummary), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaymentHistorySummary>> GetPaymentHistory(int userId)
    {
        try
        {
            var paymentHistory = await _paymentHistoryServices.GetPaymentHistoryByUserIdAsync(userId);
            return Ok(paymentHistory);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
