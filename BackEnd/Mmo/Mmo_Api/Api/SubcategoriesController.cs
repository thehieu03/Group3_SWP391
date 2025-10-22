using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Mmo_Application.Services.Interface;

namespace Mmo_Api.Api;

[Route("api/subcategories")]
[ApiController]
public class SubcategoriesController : ControllerBase
{
    private readonly ISubcategoryServices _subcategoryServices;
    private readonly IMapper _mapper;

    public SubcategoriesController(ISubcategoryServices subcategoryServices, IMapper mapper)
    {
        _subcategoryServices = subcategoryServices;
        _mapper = mapper;
    }

    [HttpGet]
    [EnableQuery]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(IEnumerable<SubcategoryResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<SubcategoryResponse>>> GetAll([FromQuery] int? categoryId)
    {
        var subcategories = await _subcategoryServices.GetAllAsync();
        if (categoryId.HasValue)
        {
            subcategories = subcategories.Where(s => s.CategoryId == categoryId.Value);
        }

        if (!subcategories.Any()) return NotFound();

        var dataResponse = _mapper.Map<IEnumerable<SubcategoryResponse>>(subcategories);
        return Ok(dataResponse);
    }
}


