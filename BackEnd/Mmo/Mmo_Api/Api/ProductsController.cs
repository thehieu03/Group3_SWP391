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
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(PaginationResponse<ProductResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginationResponse<ProductResponse>>> GetProductsByCategory([FromQuery] int categoryId,
        [FromQuery] int? subcategoryId, [FromQuery] string? searchTerm, [FromQuery] string? sortBy,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 8)
    {
        if (categoryId <= 0)
        {
            return BadRequest("CategoryId is required and must be greater than 0");
        }

        page = Math.Max(1, page);
        pageSize = Math.Max(1, pageSize);

        var products = await _productServices.GetAllWithRelatedAsync();

        products = products.Where(p => p.CategoryId == (uint)categoryId);

        if (subcategoryId.HasValue)
        {
            products = products.Where(p => p.SubcategoryId == (uint?)subcategoryId.Value && 
                                         p.Subcategory != null && 
                                         p.Subcategory.IsActive == true);
        }
        else
        {
            products = products.Where(p => p.Subcategory == null || p.Subcategory.IsActive == true);
        }

        if (!string.IsNullOrEmpty(searchTerm))
        {
            products = products.Where(p => p.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
        }

        var totalItems = products.Count();
        var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

        if (totalItems == 0)
        {
            return Ok(new PaginationResponse<ProductResponse>
            {
                Data = new List<ProductResponse>(),
                CurrentPage = page,
                TotalPages = 0,
                TotalItems = 0,
                ItemsPerPage = pageSize,
                HasNextPage = false,
                HasPreviousPage = false
            });
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

        var paginatedData = resultResponse
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var paginationResponse = new PaginationResponse<ProductResponse>
        {
            Data = paginatedData,
            CurrentPage = page,
            TotalPages = totalPages,
            TotalItems = totalItems,
            ItemsPerPage = pageSize,
            HasNextPage = page < totalPages,
            HasPreviousPage = page > 1
        };

        return Ok(paginationResponse);
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