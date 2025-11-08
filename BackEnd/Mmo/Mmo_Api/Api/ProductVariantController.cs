using Mmo_Domain.ModelRequest;

namespace Mmo_Api.Api;

[Route("api/productVariants")]
[ApiController]
public class ProductVariantController : ControllerBase
{
    private readonly IProductVariantServices _productVariantServices;
    private readonly IMapper _mapper;
    private readonly ILogger<ProductVariantController>? _logger;

    public ProductVariantController(
        IProductVariantServices productVariantServices, 
        IMapper mapper,
        ILogger<ProductVariantController>? logger = null)
    {
        _productVariantServices = productVariantServices;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("product/{productId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(IEnumerable<ProductVariantResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProductVariantResponse>>> GetProductVariantsByProductId(int productId)
    {
        try
        {
            var productVariants = await _productVariantServices.GetByProductIdAsync(productId);

            if (productVariants == null || !productVariants.Any())
                return NotFound(new { message = $"No product variants found for product ID {productId}" });

            // Map using AutoMapper - AutoMapper automatically handles IEnumerable mapping
            var resultResponse = _mapper.Map<IEnumerable<ProductVariantResponse>>(productVariants);

            return Ok(resultResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateProductVariant([FromBody] ProductVariantRequest request)
    {
        _logger?.LogInformation("CreateProductVariant called with Request: {@Request}", new
        {
            request?.ProductId,
            request?.Name,
            request?.Price,
            request?.Stock
        });

        if (request == null)
        {
            _logger?.LogWarning("CreateProductVariant: request is null");
            return BadRequest(new { message = "Request is null" });
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .Select(x => new { Field = x.Key, Errors = x.Value?.Errors.Select(e => e.ErrorMessage) });
            _logger?.LogWarning("CreateProductVariant: ModelState is invalid. Errors: {@Errors}", errors);
            return BadRequest(new { message = "Invalid request data", errors });
        }

        try
        {
            // Create product variant (logic được thực hiện trong service)
            var (success, errorMessage, variantId) = await _productVariantServices.CreateProductVariantAsync(request);
            
            if (!success)
            {
                _logger?.LogWarning("CreateProductVariant: Failed to create variant. Error: {Error}", errorMessage);
                
                if (errorMessage?.Contains("not found") == true)
                    return NotFound(new { message = errorMessage });
                
                return BadRequest(new { message = errorMessage ?? "Failed to create product variant" });
            }

            _logger?.LogInformation("CreateProductVariant: Successfully created variant {VariantId} for ProductId: {ProductId}", 
                variantId, request.ProductId);

            // Get created variant to return
            var variant = await _productVariantServices.GetByIdAsync(variantId ?? 0);
            if (variant == null)
            {
                return Ok(new { 
                    message = "Product variant created successfully", 
                    variantId = variantId,
                    productId = request.ProductId
                });
            }

            var response = _mapper.Map<ProductVariantResponse>(variant);
            return Ok(new { 
                message = "Product variant created successfully", 
                variant = response
            });
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "CreateProductVariant: Error creating product variant");
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }
}