using Mmo_Domain.ModelRequest;
using System.Security.Claims;
using Mmo_Application.Services.Interface;

namespace Mmo_Api.Api;

[Route("api/orders")]
[ApiController]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderServices _orderServices;
    private readonly IShopServices _shopServices;
    private readonly IMapper _mapper;
    private readonly ILogger<OrderController>? _logger;
    private readonly IRabbitMQService? _rabbitMQService;

    public OrderController(
        IOrderServices orderServices, 
        IShopServices shopServices, 
        IMapper mapper,
        ILogger<OrderController>? logger = null,
        IRabbitMQService? rabbitMQService = null)
    {
        _orderServices = orderServices;
        _shopServices = shopServices;
        _mapper = mapper;
        _logger = logger;
        _rabbitMQService = rabbitMQService;
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

    /// <summary>
    /// Lấy chi tiết đơn hàng của user (dành cho buyer)
    /// </summary>
    /// <param name="orderId">ID của order</param>
    /// <returns>Chi tiết order với payload</returns>
    [HttpGet("{orderId}/user-details")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<OrderUserResponse>> GetUserOrderDetails(int orderId)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid token");
            }

            // Lấy order
            var order = await _orderServices.GetOrderByIdAsync(orderId);
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            // Kiểm tra order thuộc về user hiện tại
            if (order.AccountId != userId)
            {
                return Unauthorized(new { message = "This order does not belong to you" });
            }

            // Map to OrderUserResponse
            var response = _mapper.Map<OrderUserResponse>(order);
            if (response != null)
            {
                response.hasFeedback = await _orderServices.HasFeedbackAsync(orderId);
            }

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "GetUserOrderDetails: Error getting order details for OrderId: {OrderId}", orderId);
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Lấy chi tiết đơn hàng với thông tin tài khoản đã bán (dành cho seller)
    /// </summary>
    /// <param name="orderId">ID của order</param>
    /// <returns>Chi tiết order với thông tin tài khoản</returns>
    [HttpGet("{orderId}/details")]
    [Authorize(Policy = "AdminOrSeller")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<OrderDetailResponse>> GetOrderDetails(int orderId)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid token");
            }

            // Lấy shop của seller hiện tại
            var shop = await _shopServices.GetByAccountIdAsync(userId);
            if (shop == null)
            {
                return NotFound(new { message = "Shop not found for this account" });
            }

            // Lấy order
            var order = await _orderServices.GetOrderByIdAsync(orderId);
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            // Kiểm tra order có ProductVariant không
            if (order.ProductVariant == null)
            {
                return NotFound(new { message = "Product variant not found for this order" });
            }

            // Kiểm tra order thuộc về shop của seller
            if (order.ProductVariant.Product == null || order.ProductVariant.Product.ShopId != shop.Id)
            {
                return Unauthorized(new { message = "This order does not belong to your shop" });
            }

            // Tạo response - chỉ lấy Payload từ Order
            var response = new OrderDetailResponse
            {
                OrderId = order.Id,
                ProductName = order.ProductVariant?.Product?.Name,
                ProductVariantName = order.ProductVariant?.Name,
                Quantity = order.Quantity,
                TotalPrice = order.TotalPrice,
                Status = order.Status.ToString(),
                OrderDate = order.CreatedAt,
                Payload = order.Payload,
                Accounts = null // Không cần lấy accounts từ ProductStorage
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "GetOrderDetails: Error getting order details for OrderId: {OrderId}", orderId);
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    /// <summary>
    /// Tạo đơn hàng mới
    /// </summary>
    /// <param name="request">Thông tin đơn hàng cần tạo</param>
    /// <returns>Kết quả tạo đơn hàng</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            if (request == null)
            {
                return BadRequest(new { message = "Request cannot be null" });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var result = await _orderServices.CreateOrderAsync(userId, request);
            
            if (!result.Success)
            {
                return BadRequest(new { message = result.ErrorMessage });
            }

            if (result.Order != null)
            {
                // Publish to Order Queue
                var orderMessage = new OrderQueueMessage
                {
                    OrderId = result.Order.Id,
                    AccountId = userId,
                    ProductVariantId = request.ProductVariantId,
                    Quantity = request.Quantity,
                    TotalPrice = result.Order.TotalPrice
                };

                _rabbitMQService?.PublishToOrderQueue(orderMessage);
                _logger?.LogInformation("CreateOrder: Order {OrderId} published to Order Queue", result.Order.Id);
            }

            return Ok(new { 
                message = "Order created successfully", 
                orderId = result.Order?.Id,
                status = result.Order?.Status.ToString() ?? "Pending"
            });
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "CreateOrder: Error creating order");
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }
}