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

            return Ok(listOrderUserResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("user/{accountId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetUserOrders(int accountId)
    {
        try
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserIdClaim) || !int.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized("Invalid token");
            if (currentUserId != accountId) return Forbid("You can only view your own orders");

            var orders = await _orderServices.GetUserOrdersAsync(accountId);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}