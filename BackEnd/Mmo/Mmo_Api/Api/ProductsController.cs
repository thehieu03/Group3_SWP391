using Mmo_Domain.ModelRequest;
using Mmo_Application.Services.Interface;

namespace Mmo_Api.Api;

[Route("api/products")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductServices _productServices;
    private readonly IRabbitMQService _rabbitMQService;
    private readonly IProductVariantServices _productVariantServices;
    private readonly IMapper _mapper;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ProductsController>? _logger;

    public ProductsController(
        IProductServices productServices, 
        IRabbitMQService rabbitMQService,
        IProductVariantServices productVariantServices,
        IMapper mapper, 
        IWebHostEnvironment environment, 
        ILogger<ProductsController>? logger = null)
    {
        _productServices = productServices;
        _rabbitMQService = rabbitMQService;
        _productVariantServices = productVariantServices;
        _mapper = mapper;
        _environment = environment;
        _logger = logger;
    }

    [HttpGet]
    [EnableQuery]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(IEnumerable<ProductResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAllProduct([FromQuery] int? categoryId,
        [FromQuery] int? subcategoryId, [FromQuery] string? searchTerm, [FromQuery] string? sortBy)
    {
        var products = await _productServices.GetAllWithRelatedAsync();


        if (categoryId.HasValue) products = products.Where(p => p.CategoryId == (uint?)categoryId.Value);


        if (subcategoryId.HasValue) products = products.Where(p => p.SubcategoryId == (uint?)subcategoryId.Value);


        if (!string.IsNullOrEmpty(searchTerm))
            products = products.Where(p => p.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));

        if (!products.Any()) return NotFound();

        var resultResponse = _mapper.Map<IEnumerable<ProductResponse>>(products);

        if (!string.IsNullOrEmpty(sortBy))
            switch (sortBy.ToLower())
            {
                case "price_asc":

                    resultResponse = resultResponse
                        .OrderBy(p => p.MinPrice ?? 0)
                        .ThenBy(p => p.Name);
                    break;
                case "price_desc":

                    resultResponse = resultResponse
                        .OrderByDescending(p => p.MaxPrice ?? 0)
                        .ThenBy(p => p.Name);
                    break;
                case "name_asc":
                    resultResponse = resultResponse.OrderBy(p => p.Name);
                    break;
                case "name_desc":
                    resultResponse = resultResponse.OrderByDescending(p => p.Name);
                    break;
                case "rating_desc":
                    resultResponse = resultResponse.OrderByDescending(p => p.AverageRating);
                    break;
            }

        return Ok(resultResponse);
    }

    [HttpGet("{id}")]
    [EnableQuery]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(IEnumerable<ProductResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAllProductByCategoryId(int id)
    {
        var products = await _productServices.GetAllAsync();
        var filteredProducts = products.Where(p => p.CategoryId == (uint)id);
        if (!filteredProducts.Any()) return NotFound();

        var resultResponse = _mapper.Map<IEnumerable<ProductResponse>>(filteredProducts);
        return Ok(resultResponse);
    }

    [HttpGet("getProductById")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProductResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProductResponse>> GetProductById([FromQuery] int id)
    {
        var productResult = await _productServices.GetByIdAsync(id);
        if (productResult == null) return NotFound();

        var productResponse = _mapper.Map<ProductResponse>(productResult);
        return Ok(productResponse);
    }

    [HttpGet("shop/{shopId}")]
    [EnableQuery]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(IEnumerable<ProductResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetProductsByShopId(int shopId)
    {
        var products = await _productServices.GetProductsByShopIdAsync(shopId);
        if (!products.Any()) return NotFound();

        var resultResponse = _mapper.Map<IEnumerable<ProductResponse>>(products);
        return Ok(resultResponse);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct([FromForm] ProductRequest productRequest, [FromForm] IFormFile? image)
    {
        _logger?.LogInformation("CreateProduct called with Request: {@Request}", new
        {
            productRequest?.Name,
            productRequest?.Description,
            productRequest?.CategoryId,
            productRequest?.SubcategoryId,
            productRequest?.ShopId,
            HasImage = image != null
        });

        if (productRequest == null)
        {
            _logger?.LogWarning("CreateProduct: productRequest is null");
            return BadRequest(new { message = "Product request is null" });
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .Select(x => new { Field = x.Key, Errors = x.Value?.Errors.Select(e => e.ErrorMessage) });
            _logger?.LogWarning("CreateProduct: ModelState is invalid. Errors: {@Errors}", errors);
            return BadRequest(new { message = "Invalid request data", errors });
        }

        try
        {
            // Handle image upload if provided (cần xử lý trước khi đưa vào queue)
            string? imageUrl = null;
            if (image != null)
            {
                if (!image.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "File must be an image" });

                const long maxSize = 10 * 1024 * 1024; // 10MB
                if (image.Length > maxSize)
                    return BadRequest(new { message = "Image size must be ≤ 10MB" });

                // Save image to Products folder using HelperImage
                imageUrl = await HelperImage.SaveImageByType(Mmo_Domain.Enum.ImageCategory.Products, image, _environment);
            }

            // Tạo message để đưa vào queue
            var productMessage = new ProductCreateMessage
            {
                ShopId = productRequest.ShopId,
                CategoryId = productRequest.CategoryId,
                SubcategoryId = productRequest.SubcategoryId,
                Name = productRequest.Name,
                Description = productRequest.Description,
                Details = productRequest.Details,
                ImageUrl = imageUrl
            };

            // Parse variants nếu có (từ FormData - có thể là JSON string)
            // Variants sẽ được parse từ FormData trong consumer
            // Ở đây chỉ cần lưu thông tin cơ bản, variants sẽ được xử lý trong consumer

            // Publish message vào RabbitMQ queue để xử lý theo thứ tự
            var messageJson = productMessage.ToJson();
            _rabbitMQService.PublishProductCreationMessage(messageJson);

            _logger?.LogInformation("Product creation request queued. Product: {ProductName}", productRequest.Name);

            return Ok(new { 
                message = "Product creation request has been queued and will be processed in order",
                status = "queued"
            });
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "CreateProduct: Error creating product");
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    [HttpPut("{id}/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProductStatus(int id, [FromBody] UpdateProductStatusRequest request)
    {
        if (request == null || id != request.ProductId)
            return BadRequest(new { message = "Invalid request" });

        var result = await _productServices.UpdateProductStatusAsync(id, request.IsActive);
        if (!result) return NotFound(new { message = "Product not found" });

        return Ok(new { message = "Product status updated successfully" });
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProduct(int id, [FromForm] ProductRequest productRequest, [FromForm] IFormFile? image, [FromForm] string? variants)
    {
        // Log incoming request for debugging
        _logger?.LogInformation("UpdateProduct called with id: {Id}, Request: {@Request}", id, new
        {
            productRequest?.Name,
            productRequest?.Description,
            productRequest?.CategoryId,
            productRequest?.SubcategoryId,
            productRequest?.ShopId,
            HasImage = image != null
        });

        if (productRequest == null)
        {
            _logger?.LogWarning("UpdateProduct: productRequest is null");
            return BadRequest(new { message = "Product request is null" });
        }

        // Parse variants from JSON string if provided
        if (!string.IsNullOrEmpty(variants))
        {
            try
            {
                productRequest.Variants = System.Text.Json.JsonSerializer.Deserialize<List<ProductVariantRequest>>(variants);
                _logger?.LogInformation("UpdateProduct: Parsed {Count} variants from JSON", productRequest.Variants?.Count ?? 0);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning("UpdateProduct: Failed to parse variants JSON: {Error}", ex.Message);
                return BadRequest(new { message = "Invalid variants JSON format", error = ex.Message });
            }
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .Select(x => new { Field = x.Key, Errors = x.Value?.Errors.Select(e => e.ErrorMessage) });
            _logger?.LogWarning("UpdateProduct: ModelState is invalid. Errors: {@Errors}", errors);
            return BadRequest(new { message = "Invalid request data", errors });
        }

        var product = await _productServices.GetByIdAsync(id);
        if (product == null)
        {
            _logger?.LogWarning("UpdateProduct: Product with id {Id} not found", id);
            return NotFound(new { message = "Product not found" });
        }

        try
        {
            // Update product fields
            product.Name = productRequest.Name;
            product.Description = productRequest.Description;
            product.CategoryId = productRequest.CategoryId;
            product.SubcategoryId = productRequest.SubcategoryId;
            product.Details = productRequest.Details;
            product.UpdatedAt = DateTime.UtcNow;

            // Handle image upload if provided
            if (image != null)
            {
                if (!image.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "File must be an image" });

                const long maxSize = 10 * 1024 * 1024; // 10MB
                if (image.Length > maxSize)
                    return BadRequest(new { message = "Image size must be ≤ 10MB" });

                // Delete old image if exists
                if (!string.IsNullOrEmpty(product.ImageUrl))
                    HelperImage.DeleteImage(product.ImageUrl, null);

                // Save new image
                var imageUrl = await HelperImage.SaveImageByType(Mmo_Domain.Enum.ImageCategory.Products, image, _environment);
                product.ImageUrl = imageUrl;
                product.ImageUploadedAt = DateTime.UtcNow;
            }

            var result = await _productServices.UpdateAsync(product);
            if (!result)
                return BadRequest(new { message = "Failed to update product" });

            // Update variants if provided
            if (productRequest.Variants != null && productRequest.Variants.Any())
            {
                foreach (var variantRequest in productRequest.Variants)
                {
                    // If variant has ID, update existing variant
                    if (variantRequest.Id.HasValue)
                    {
                        var updateRequest = new ProductVariantRequest
                        {
                            ProductId = product.Id,
                            Name = variantRequest.Name,
                            Price = variantRequest.Price,
                            Stock = variantRequest.Stock
                        };

                        var (variantSuccess, variantError) = await _productVariantServices.UpdateProductVariantAsync(
                            variantRequest.Id.Value, 
                            updateRequest
                        );

                        if (!variantSuccess)
                        {
                            _logger?.LogWarning("Failed to update variant {VariantId}: {Error}", 
                                variantRequest.Id.Value, variantError);
                            // Continue with other variants instead of failing entire request
                        }
                        else
                        {
                            _logger?.LogInformation("Variant {VariantId} updated successfully", variantRequest.Id.Value);
                        }
                    }
                    // If variant doesn't have ID, create new variant (optional - for future use)
                }
            }

            return Ok(new { message = "Product updated successfully", productId = product.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }
}