using Mmo_Application.Services.Interface;

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
        var result=await _productServices.AddAsync(productAdd);
        return result>0?Ok():BadRequest();
    }
}
