namespace Mmo_Api.Api;

[Route("api/shops")]
[ApiController]
public class ShopController : ControllerBase
{
    private readonly IShopServices _shopServices;
    private readonly IMapper _mapper;
    private readonly IAccountServices _accountServices;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ShopController> _logger;

    public ShopController(IShopServices shopServices, IMapper mapper, IAccountServices accountServices,
        IWebHostEnvironment environment, ILogger<ShopController> logger)
    {
        _shopServices = shopServices;
        _mapper = mapper;
        _accountServices = accountServices;
        _environment = environment;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [EnableQuery]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ShopListResponse>> GetAll()
    {
        try
        {
            var shops = await _shopServices.GetAllWithDetailsAsync();
            if (!shops.Any()) return NotFound("No shops found");

            var shopResponses = new List<ShopResponse>();
            foreach (var shop in shops)
            {
                var shopResponse = _mapper.Map<ShopResponse>(shop);
                shopResponse.OwnerUsername = shop.Account?.Username;
                shopResponse.ProductCount = shop.Products?.Count ?? 0;
                shopResponse.ComplaintCount = shop.Replies?.Count ?? 0;
                shopResponses.Add(shopResponse);
            }

            var statistics = await _shopServices.GetShopStatisticsAsync();

            var response = new ShopListResponse
            {
                Shops = shopResponses,
                Statistics = statistics
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ShopResponse>> GetById(int id)
    {
        try
        {
            var shop = await _shopServices.GetByIdAsync(id);
            if (shop == null) return NotFound("Shop not found");


            var shopsWithDetails = await _shopServices.GetAllWithDetailsAsync();
            shop = shopsWithDetails.FirstOrDefault(s => s.Id == id);

            if (shop == null) return NotFound("Shop not found");

            var shopResponse = _mapper.Map<ShopResponse>(shop);
            shopResponse.OwnerUsername = shop!.Account!.Username;
            shopResponse.ProductCount = shop.Products?.Count ?? 0;
            shopResponse.ComplaintCount = shop.Replies?.Count ?? 0; // Assuming complaints are stored in Replies

            return Ok(shopResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] Shop shop)
    {
        try
        {
            if (shop == null || !ModelState.IsValid) return BadRequest(ModelState);

            shop.CreatedAt = DateTime.UtcNow;
            shop.Status = "PENDING"; // Mặc định là PENDING khi tạo shop
            var result = await _shopServices.AddAsync(shop);

            return result > 0
                ? Ok(new { message = "Shop created successfully", id = result })
                : BadRequest("Failed to create shop");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] Shop request)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var shop = await _shopServices.GetByIdAsync(id);
            if (shop == null) return NotFound("Shop not found");

            shop.Name = string.IsNullOrWhiteSpace(request.Name) ? shop.Name : request.Name;
            shop.Description = request.Description ?? shop.Description;
            shop.Status = request.Status ?? shop.Status;
            shop.UpdatedAt = DateTime.UtcNow;

            var updated = await _shopServices.UpdateAsync(shop);
            return updated ? Ok(new { message = "Shop updated successfully" }) : BadRequest("Failed to update shop");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var shop = await _shopServices.GetByIdAsync(id);
            if (shop == null) return NotFound("Shop not found");

            var deleted = await _shopServices.DeleteAsync(shop);
            return deleted ? Ok(new { message = "Shop deleted successfully" }) : BadRequest("Failed to delete shop");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{shopId}/status")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateShopStatus(int shopId, [FromBody] UpdateShopStatusRequest request)
    {
        try
        {
            if (request == null) return BadRequest(new { message = "Request body cannot be null" });

            if (request.ShopId != shopId)
                return BadRequest(new { message = "Shop ID in URL and request body must match" });

            if (shopId <= 0) return BadRequest(new { message = "Invalid shop ID" });


            if (string.IsNullOrEmpty(request.Status) ||
                (request.Status != "PENDING" && request.Status != "APPROVED" && request.Status != "BANNED"))
                return BadRequest(new { message = "Status must be PENDING, APPROVED, or BANNED" });


            var shop = await _shopServices.GetByIdAsync(shopId);
            if (shop == null) return NotFound(new { message = "Shop not found" });


            var result = await _shopServices.UpdateShopStatusAsync(shopId, request.Status);

            if (!result) return StatusCode(500, new { message = "Failed to update shop status" });

            var message = $"Shop status updated to {request.Status} successfully";

            return Ok(new { message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
    }

    [HttpPut("{shopId}/approve")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> ApproveShop(int shopId)
    {
        try
        {
            if (shopId <= 0) return BadRequest(new { message = "Invalid shop ID" });


            var shop = await _shopServices.GetByIdAsync(shopId);
            if (shop == null) return NotFound(new { message = "Shop not found" });


            var result = await _shopServices.ApproveShopAsync(shopId);

            if (!result) return StatusCode(500, new { message = "Failed to approve shop" });

            return Ok(new { message = "Shop approved successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
    }

    [HttpPut("{shopId}/ban")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> BanShop(int shopId)
    {
        try
        {
            if (shopId <= 0) return BadRequest(new { message = "Invalid shop ID" });


            var shop = await _shopServices.GetByIdAsync(shopId);
            if (shop == null) return NotFound(new { message = "Shop not found" });


            var result = await _shopServices.BanShopAsync(shopId);

            if (!result) return StatusCode(500, new { message = "Failed to ban shop" });

            return Ok(new { message = "Shop banned successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
    }

    [HttpPost("register")]
    [Authorize]
    [RequestSizeLimit(20_000_000)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RegisterShop(
        [FromForm] string name,
        [FromForm] string phone,
        [FromForm] string description,
        [FromForm] IFormFile identificationF,
        [FromForm] IFormFile identificationB)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(phone) ||
                string.IsNullOrWhiteSpace(description))
                return BadRequest(new { message = "Thiếu thông tin bắt buộc" });

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
                return Unauthorized(new { message = "Không xác thực được người dùng" });

            var allShops = await _shopServices.GetAllAsync();
            if (allShops.Any(s => s.AccountId == userId))
                return BadRequest(new { message = "Bạn đã có shop, không thể đăng ký thêm" });

            var account = await _accountServices.GetByIdAsync(userId);
            if (account == null) return BadRequest(new { message = "Tài khoản không tồn tại" });

            if (identificationF == null || identificationB == null)
                return BadRequest(new { message = "Cần tải lên đủ 2 ảnh CMND/CCCD" });

            // Validate image files
            if (!identificationF.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) ||
                !identificationB.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "File phải là hình ảnh" });

            const long maxSize = 10 * 1024 * 1024; // 10MB
            if (identificationF.Length > maxSize || identificationB.Length > maxSize)
                return BadRequest(new { message = "Kích thước file không được vượt quá 10MB" });

            // Delete old images if exists
            if (!string.IsNullOrEmpty(account.IdentificationFurl))
                HelperImage.DeleteImage(account.IdentificationFurl, _logger);
            if (!string.IsNullOrEmpty(account.IdentificationBurl))
                HelperImage.DeleteImage(account.IdentificationBurl, _logger);

            // Save identification images to Shops folder using HelperImage
            var identificationFurl =
                await HelperImage.SaveImageByType(Mmo_Domain.Enum.ImageCategory.Shops, identificationF, _environment);

            var identificationBurl =
                await HelperImage.SaveImageByType(Mmo_Domain.Enum.ImageCategory.Shops, identificationB, _environment);

            account.Phone = phone.Trim();
            account.IdentificationFurl = identificationFurl;
            account.IdentificationBurl = identificationBurl;
            account.IdentificationFuploadedAt = DateTime.UtcNow;
            account.IdentificationBuploadedAt = DateTime.UtcNow;
            account.UpdatedAt = DateTime.UtcNow;
            var updated = await _accountServices.UpdateAsync(account);
            if (!updated) return StatusCode(500, new { message = "Cập nhật tài khoản thất bại" });

            var shop = new Shop
            {
                Name = name.Trim(),
                Description = description.Trim(),
                AccountId = userId,
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var addResult = await _shopServices.AddAsync(shop);
            if (addResult <= 0) return StatusCode(500, new { message = "Tạo shop thất bại" });

            return Ok(new { message = "Đăng ký shop thành công, chờ duyệt", shopId = shop.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
        }
    }

    [HttpGet("account/{accountId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ShopResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ShopResponse>> GetShopByAccountId(int accountId)
    {
        try
        {
            var shop = await _shopServices.GetByAccountIdAsync(accountId);
            
            if (shop == null)
                return NotFound(new { message = $"No shop found for account ID {accountId}" });

            var shopResponse = _mapper.Map<ShopResponse>(shop);
            shopResponse.OwnerUsername = shop.Account?.Username ?? "Unknown";
            shopResponse.ProductCount = shop.Products?.Count ?? 0;
            shopResponse.ComplaintCount = shop.Replies?.Count ?? 0;
            shopResponse.IdentificationFurl = shop.Account?.IdentificationFurl;
            shopResponse.IdentificationBurl = shop.Account?.IdentificationBurl;

            return Ok(shopResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}