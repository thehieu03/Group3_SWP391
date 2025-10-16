using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Mmo_Application.Services;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelResponse;

namespace Mmo_Api.Api
{
    [Route("api/categories")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryServices _categoryServices;
        private readonly IMapper _mapper;
        public CategoriesController(ICategoryServices categoryServices, IMapper mapper)
        {
            _categoryServices = categoryServices;
            _mapper = mapper;
        }
        [HttpGet]
        [EnableQuery]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(IEnumerable<CategoryResponse>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetAllAccounts()
        {
            try
            {
                var accounts = await _categoryServices.GetAllAsync();
                if (accounts == null || !accounts.Any())
                {
                    return NotFound("No accounts found.");
                }
                var dataResponse = _mapper.Map<List<CategoryResponse>>(accounts);
                return Ok(dataResponse);
            }
            catch (Exception)
            {
                return NotFound();
                throw;
            }
        }
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryRequest categoryRequest)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);
            var categoryAdd = _mapper.Map<Category>(categoryRequest);
            categoryAdd.IsActive = true;
            var result= await _categoryServices.AddAsync(categoryAdd);
            return result > 0 ? Ok(result) : BadRequest("Failed to create category.");
        }
    }
}
