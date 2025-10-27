using Microsoft.AspNetCore.Mvc;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelResponse;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Mmo_Api.Api;

[Route("api/orders")]
[ApiController]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderServices _orderServices;
    private readonly IMapper _mapper;

    public OrderController(IOrderServices orderServices, IMapper mapper)
    {
        _orderServices = orderServices;
        _mapper = mapper;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [EnableQuery]
    [ProducesResponseType<IEnumerable<OrderAdminResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<OrderAdminResponse>>> GetAllOrders()
    {
        var result = await _orderServices.AdminGetAllOrderAsync();
        var response = _mapper.Map<IEnumerable<OrderAdminResponse>>(result);
        return response == null ? NotFound() : Ok(response);
    }

    [HttpGet("my-orders")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EnableQuery]
    public async Task<ActionResult<IEnumerable<OrderUserResponse>>> GetMyOrders()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid token");

            var orders = await _orderServices.GetUserOrdersAsync(userId);
            var listOrderUserResponse = _mapper.Map<List<OrderUserResponse>>(orders);


            foreach (var orderResponse in listOrderUserResponse)
            {
                orderResponse.hasFeedback = await _orderServices.HasFeedbackAsync(orderResponse.OrderId);
            }

            return Ok(listOrderUserResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
