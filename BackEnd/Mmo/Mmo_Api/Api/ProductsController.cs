using Mmo_Domain.ModelRequest;
using Mmo_Application.Services.Interface;
using System.Text.Json;

namespace Mmo_Api.Api;

[Route("api/products")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductServices _productServices;
    private readonly IProductVariantServices _productVariantServices;
    private readonly IProductStorageServices _productStorageServices;
    private readonly ISystemsconfigServices _systemsconfigServices;
    private readonly IMapper _mapper;
    private readonly IWebHostEnvironment _environment;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public ProductsController(
        IProductServices productServices, 
        IProductVariantServices productVariantServices,
        IProductStorageServices productStorageServices,
        ISystemsconfigServices systemsconfigServices,
        IMapper mapper, 
        IWebHostEnvironment environment)
    {
        _productServices = productServices;
        _productVariantServices = productVariantServices;
        _productStorageServices = productStorageServices;
        _systemsconfigServices = systemsconfigServices;
        _mapper = mapper;
        _environment = environment;
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

        // Only show active products for public viewing
        products = products.Where(p => p.IsActive == true);

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
        // Only show active products for public viewing
        var filteredProducts = products.Where(p => p.CategoryId == (uint)id && p.IsActive == true);
        if (!filteredProducts.Any()) return NotFound();

        var resultResponse = _mapper.Map<IEnumerable<ProductResponse>>(filteredProducts);
        return Ok(resultResponse);
    }

    [HttpGet("getProductById")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProductResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProductResponse>> GetProductById([FromQuery] int id, [FromQuery] bool includeInactive = false)
    {
        var productResult = await _productServices.GetByIdAsync(id);
        if (productResult == null) return NotFound();

        // Only show active products for public viewing, unless includeInactive is true (for sellers editing their products)
        if (!includeInactive && productResult.IsActive != true) return NotFound();

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
    public async Task<IActionResult> CreateProduct([FromForm] ProductRequest productRequest, [FromForm] IFormFile? image, [FromForm] string? variants)
    {
        if (productRequest == null)
        {
            return BadRequest(new { message = "Product request is null" });
        }

        // Parse variants from JSON string if provided
        if (!string.IsNullOrEmpty(variants))
        {
            var parseResult = ParseVariantsFromJson(variants);
            if (!parseResult.Success)
            {
                return BadRequest(new { message = "Invalid variants JSON format", error = parseResult.ErrorMessage });
            }
            productRequest.Variants = parseResult.Variants;
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .Select(x => new { Field = x.Key, Errors = x.Value?.Errors.Select(e => e.ErrorMessage) });
            return BadRequest(new { message = "Invalid request data", errors });
        }

        try
        {
            // Handle image upload if provided
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

            // Get fee from Systemsconfig
            var productFee = await GetProductFeeAsync();

            // Bước 1: Tạo Product
            var product = new Product
            {
                ShopId = productRequest.ShopId,
                CategoryId = productRequest.CategoryId,
                SubcategoryId = productRequest.SubcategoryId,
                Name = productRequest.Name,
                Description = productRequest.Description,
                Details = productRequest.Details,
                ImageUrl = imageUrl,
                Fee = productFee,
                IsActive = false, // Mặc định sản phẩm mới tạo sẽ chưa hoạt động
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (!string.IsNullOrEmpty(imageUrl))
            {
                product.ImageUploadedAt = DateTime.UtcNow;
            }

            // Create product - EF Core will automatically set product.Id after save
            var saveResult = await _productServices.AddAsync(product);
            
            if (saveResult <= 0)
            {
                return BadRequest(new { message = "Failed to create product" });
            }

            // Get actual ID from entity after save (EF Core automatically sets ID)
            var productId = product.Id;
            if (productId <= 0)
            {
                return BadRequest(new { message = "Failed to create product - invalid product ID" });
            }

            // Create variants and storages if provided
            if (productRequest.Variants != null && productRequest.Variants.Any())
            {
                await CreateProductVariantsAsync(productId, productRequest.Variants);
            }

            return Ok(new { 
                message = "Product created successfully",
                productId = productId,
                status = "success"
            });
        }
        catch (Exception ex)
        {
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
        if (productRequest == null)
        {
            return BadRequest(new { message = "Product request is null" });
        }

        // Parse variants from JSON string if provided
        if (!string.IsNullOrEmpty(variants))
        {
            var parseResult = ParseVariantsFromJson(variants);
            if (!parseResult.Success)
            {
                return BadRequest(new { message = "Invalid variants JSON format", error = parseResult.ErrorMessage });
            }
            productRequest.Variants = parseResult.Variants;
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .Select(x => new { Field = x.Key, Errors = x.Value?.Errors.Select(e => e.ErrorMessage) });
            return BadRequest(new { message = "Invalid request data", errors });
        }

        var product = await _productServices.GetByIdAsync(id);
        if (product == null)
        {
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
                            // Variant update failed, continue with other variants
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
    
    private (bool Success, List<ProductVariantRequest>? Variants, string? ErrorMessage) ParseVariantsFromJson(string variantsJson)
    {
        try
        {
            var variants = JsonSerializer.Deserialize<List<ProductVariantRequest>>(variantsJson, JsonOptions);
            return (true, variants, null);
        }
        catch (Exception ex)
        {
            return (false, null, ex.Message);
        }
    }

    private async Task<decimal?> GetProductFeeAsync()
    {
        try
        {
            var systemConfigs = await _systemsconfigServices.GetAllAsync();
            return systemConfigs.FirstOrDefault()?.Fee;
        }
        catch (Exception ex)
        {
            return null;
        }
    }

    private async Task CreateProductVariantsAsync(int productId, IEnumerable<ProductVariantRequest> variantRequests)
    {
        foreach (var variantRequest in variantRequests)
        {
            var variantCreateRequest = new ProductVariantRequest
            {
                ProductId = productId,
                Name = variantRequest.Name,
                Price = variantRequest.Price,
                Stock = variantRequest.Stock
            };

            var (variantSuccess, variantError, variantId) = await _productVariantServices.CreateProductVariantAsync(variantCreateRequest);
            
            if (!variantSuccess)
            {
                continue;
            }

            // Create storages for variant if provided
            if (variantRequest.Storages != null && variantRequest.Storages.Any() && variantId.HasValue)
            {
                await CreateStoragesForVariantAsync(variantId.Value, variantRequest.Storages);
            }
        }
    }

    private async Task CreateStoragesForVariantAsync(int variantId, IEnumerable<ProductVariantStorageItem> storageItems)
    {
        try
        {
            var accounts = ParseStorageAccounts(storageItems);
            
            if (!accounts.Any())
            {
                return;
            }

            var storageRequest = new ProductStorageRequest
            {
                ProductVariantId = variantId,
                Accounts = accounts
            };

            var (storageSuccess, storageError, _) = await _productStorageServices.CreateProductStoragesAsync(storageRequest);

            if (!storageSuccess)
            {
                // Storage creation failed, continue with other variants
            }
        }
        catch (Exception ex)
        {
            // Error creating storages, continue with other variants
        }
    }

    private List<AccountStorageItem> ParseStorageAccounts(IEnumerable<ProductVariantStorageItem> storageItems)
    {
        var accounts = new List<AccountStorageItem>();

        foreach (var storage in storageItems)
        {
            if (string.IsNullOrEmpty(storage.Result))
                continue;

            try
            {
                var accountData = JsonSerializer.Deserialize<AccountStorageItem>(storage.Result, JsonOptions);

                if (accountData != null && 
                    !string.IsNullOrWhiteSpace(accountData.Username) &&
                    !string.IsNullOrWhiteSpace(accountData.Password))
                {
                    accounts.Add(accountData);
                }
            }
            catch (Exception ex)
            {
                // Failed to parse storage result, skip this storage
            }
        }

        return accounts;
    }
}