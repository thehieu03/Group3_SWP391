namespace Mmo_Api.Api;

[Route("api/orders")]
[ApiController]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderServices _orderServices;
    private readonly IShopServices _shopServices;
    private readonly IMapper _mapper;

    public OrderController(IOrderServices orderServices, IShopServices shopServices, IMapper mapper)
    {
        _orderServices = orderServices;
        _shopServices = shopServices;
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

    /// <summary>
    /// Lấy danh sách đơn hàng mà user đã mua
    /// </summary>
    /// <returns>Danh sách đơn hàng của user hiện tại</returns>
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
                orderResponse.hasFeedback = await _orderServices.HasFeedbackAsync(orderResponse.OrderId);

            return Ok(listOrderUserResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Lấy danh sách đơn hàng của shop (dành cho seller)
    /// </summary>
    /// <returns>Danh sách đơn hàng của shop hiện tại</returns>
    [HttpGet("shop-orders")]
    [Authorize(Policy = "AdminOrSeller")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EnableQuery]
    public async Task<ActionResult<IEnumerable<OrderAdminResponse>>> GetShopOrders()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid token");

            // Lấy shop của seller hiện tại
            var shop = await _shopServices.GetByAccountIdAsync(userId);
            
            if (shop == null)
                return NotFound(new { message = "Shop not found for this account" });

            // Lấy orders của shop
            var orders = await _orderServices.GetShopOrdersAsync(shop.Id);
            var orderResponses = _mapper.Map<List<OrderAdminResponse>>(orders);

            return Ok(orderResponses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}