using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelResponse;
using Mmo_Domain.Models;

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
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAllProduct([FromQuery] int? categoryId,
        [FromQuery] int? subcategoryId, [FromQuery] string? searchTerm, [FromQuery] string? sortBy)
    {
        var products = await _productServices.GetAllWithRelatedAsync();


        if (categoryId.HasValue)
        {
            products = products.Where(p => p.CategoryId == (uint?)categoryId.Value);
        }


        if (subcategoryId.HasValue)
        {
            products = products.Where(p => p.SubcategoryId == (uint?)subcategoryId.Value);
        }


        if (!string.IsNullOrEmpty(searchTerm))
        {
            products = products.Where(p => p.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
        }

        if (!products.Any())
        {
            return NotFound();
        }

        var resultResponse = _mapper.Map<IEnumerable<ProductResponse>>(products);

        if (!string.IsNullOrEmpty(sortBy))
        {
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
    public async Task<ActionResult<ProductResponse>> GetProductById([FromQuery] int id)
    {
        var productResult = await _productServices.GetByIdAsync(id);
        if (productResult == null)
        {
            return NotFound();
        }

        var productResponse = _mapper.Map<ProductResponse>(productResult);
        return Ok(productResponse);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct([FromBody] ProductRequest productRequest)
    {
        if (productRequest == null || !ModelState.IsValid)
        {
            return BadRequest();
        }

        var productAdd = _mapper.Map<Product>(productRequest);
        var result = await _productServices.AddAsync(productAdd);
        return result > 0 ? Ok() : BadRequest();
    }
}
