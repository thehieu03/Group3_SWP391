using Mmo_Domain.ModelRequest;
using Mmo_Application.Services.Interface;

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
            _logger?.LogError(ex, "GetProductVariantsByProductId: Error retrieving product variants");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}