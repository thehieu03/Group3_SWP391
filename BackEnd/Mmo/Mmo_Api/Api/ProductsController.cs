using Microsoft.AspNetCore.Authorization;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;

namespace Mmo_Api.Api;

[Route("api/products")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductServices _productServices;
    private readonly IMapper _mapper;

    public ProductsController(IProductServices productServices, IMapper mapper)
    {
        _productServices = productServices;
        _mapper = mapper;
    }
    [HttpGet]
    [EnableQuery]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(IEnumerable<ProductResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAllProduct()
    {
        var resultProduct = await _productServices.GetAllAsync();
        if (!resultProduct.Any()) {
            return NotFound();
        }
        var resultResponse = _mapper.Map<IEnumerable<ProductResponse>>(resultProduct);
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
        if (!filteredProducts.Any())
        {
            return NotFound();
        }
        var resultResponse = _mapper.Map<IEnumerable<ProductResponse>>(filteredProducts);
        return Ok(resultResponse);
    }
    [HttpGet("getProductById")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProductResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProductResponse>> GetProductById([FromQuery]int id) {
        var productResult=await _productServices.GetByIdAsync(id);
        if (productResult == null)
        {
            return NotFound();
        }
        var productResponse=_mapper.Map<ProductResponse>(productResult);
        return Ok(productResponse);
    }
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct([FromBody]ProductRequest productRequest)
    {
        if (productRequest == null||!ModelState.IsValid) {
            return BadRequest();
        }
        var productAdd=_mapper.Map<Product>(productRequest);
        
        // Set default values for new product
        productAdd.IsActive = true;  // Product is active
        productAdd.IsApproved = false;  // Product needs approval from admin
        productAdd.CreatedAt = DateTime.UtcNow;
        productAdd.UpdatedAt = DateTime.UtcNow;
        
        var result=await _productServices.AddAsync(productAdd);
        return result>0?Ok():BadRequest();
    }

    /// <summary>
    /// Lấy danh sách sản phẩm chờ duyệt cho Admin
    /// </summary>
    [HttpGet("pending")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPendingProducts([FromQuery] ProductApprovalRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _productServices.GetPendingProductsAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Duyệt sản phẩm
    /// </summary>
    [HttpPut("{id}/approve")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ApproveProduct(int id)
    {
        try
        {
            var result = await _productServices.ApproveProductAsync(id);
            if (!result)
            {
                return NotFound($"Product with ID {id} not found or already approved");
            }

            return Ok(new { message = "Product approved successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Từ chối sản phẩm
    /// </summary>
    [HttpDelete("{id}/reject")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RejectProduct(int id)
    {
        try
        {
            var result = await _productServices.RejectProductAsync(id);
            if (!result)
            {
                return NotFound($"Product with ID {id} not found");
            }

            return Ok(new { message = "Product rejected successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
