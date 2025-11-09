using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelResponse;
using AutoMapper;

namespace Mmo_Api.Api
{
    [Route("api/categories")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryServices _categoryServices;
        private readonly ISubcategoryServices _subcategoryServices;
        private readonly IMapper _mapper;
        private const int DefaultPageSize = 6;

        public CategoriesController(ICategoryServices categoryServices, ISubcategoryServices subcategoryServices, IMapper mapper)
        {
            _categoryServices = categoryServices;
            _subcategoryServices = subcategoryServices;
            _mapper = mapper;
        }
        
        [HttpGet]
        [EnableQuery]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(PaginationResponse<CategoryResponse>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginationResponse<CategoryResponse>>> GetAllCategories([FromQuery] int? page = null, [FromQuery] int? pageSize = null, [FromQuery] bool? isActive = null)
        {
            try
            {
                var categories = await _categoryServices.GetAllAsync();
                if (!categories.Any())
                {
                    return Ok(CreateEmptyPaginationResponse(pageSize ?? DefaultPageSize));
                }

                // Default to only active categories for public endpoints (when isActive is not explicitly provided)
                // This ensures customers only see active categories, while admins can explicitly request all categories
                if (isActive.HasValue)
                {
                    categories = categories.Where(c => c.IsActive == isActive.Value).ToList();
                }
                else
                {
                    // Default to only active categories when isActive is not provided
                    categories = categories.Where(c => c.IsActive == true).ToList();
                }

                var dataResponse = _mapper.Map<List<CategoryResponse>>(categories);

                if (page == null || pageSize == null)
                {
                    return Ok(new PaginationResponse<CategoryResponse>
                    {
                        Data = dataResponse,
                        CurrentPage = 1,
                        TotalPages = 1,
                        TotalItems = dataResponse.Count,
                        ItemsPerPage = dataResponse.Count,
                        HasNextPage = false,
                        HasPreviousPage = false
                    });
                }

                var validPage = Math.Max(1, page.Value);
                var validPageSize = Math.Max(1, pageSize.Value);

                var totalItems = dataResponse.Count;
                var totalPages = (int)Math.Ceiling((double)totalItems / validPageSize);

                var paginatedData = dataResponse
                    .Skip((validPage - 1) * validPageSize)
                    .Take(validPageSize)
                    .ToList();

                return Ok(new PaginationResponse<CategoryResponse>
                {
                    Data = paginatedData,
                    CurrentPage = validPage,
                    TotalPages = totalPages,
                    TotalItems = totalItems,
                    ItemsPerPage = validPageSize,
                    HasNextPage = validPage < totalPages,
                    HasPreviousPage = validPage > 1
                });
            }
            catch (Exception ex)
            {
                // Log chi tiết lỗi để debug
                Console.WriteLine($"[ERROR] CategoriesController.GetAllCategories: {ex.Message}");
                Console.WriteLine($"[ERROR] StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[ERROR] InnerException: {ex.InnerException.Message}");
                }
                return StatusCode(StatusCodes.Status500InternalServerError, new { 
                    message = "An error occurred while retrieving categories.",
                    error = ex.Message 
                });
            }
        }

        private static PaginationResponse<CategoryResponse> CreateEmptyPaginationResponse(int pageSize)
        {
            return new PaginationResponse<CategoryResponse>
            {
                Data = new List<CategoryResponse>(),
                CurrentPage = 1,
                TotalPages = 0,
                TotalItems = 0,
                ItemsPerPage = pageSize,
                HasNextPage = false,
                HasPreviousPage = false
            };
        }
        
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryRequest categoryRequest)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState);

            try
            {
                var categoryAdd = _mapper.Map<Category>(categoryRequest);
                categoryAdd.IsActive = true;
                var result = await _categoryServices.AddAsync(categoryAdd);
                
                if (result > 0)
                    return CreatedAtAction(nameof(GetAllCategories), new { id = result }, result);
                
                return BadRequest("Failed to create category.");
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the category.");
            }
        }
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteCategory([FromQuery] int id)
        {
            var category = await _categoryServices.GetByIdAsync(id);
            if(category == null) return BadRequest("Category not found.");
            var result = await _categoryServices.DeleteAsync(category);
            return result  ? Ok(result) : BadRequest("Failed to delete category.");
        }

        [HttpPatch("{id}/activate")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ActivateCategory(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid category ID.");

            try
            {
                var category = await _categoryServices.GetByIdAsync(id);
                if (category == null)
                    return NotFound("Category not found.");

                category.IsActive = true;
                var result = await _categoryServices.UpdateAsync(category);
                return result ? Ok(new { message = "Category activated successfully." }) : BadRequest("Failed to activate category.");
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while activating the category.");
            }
        }

        [HttpPatch("{id}/deactivate")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeactivateCategory(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid category ID.");

            try
            {
                var category = await _categoryServices.GetByIdAsync(id);
                if (category == null)
                    return NotFound("Category not found.");

                category.IsActive = false;
                var result = await _categoryServices.UpdateAsync(category);
                
                if (result)
                {
                    await _subcategoryServices.DeactivateSubcategoriesByCategoryIdAsync(id);
                    return Ok(new { message = "Category and all its subcategories deactivated successfully." });
                }
                
                return BadRequest("Failed to deactivate category.");
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deactivating the category.");
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryRequest categoryRequest)
        {
            if (id <= 0)
                return BadRequest("Invalid category ID.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var category = await _categoryServices.GetByIdAsync(id);
                if (category == null)
                    return NotFound("Category not found.");

                category.Name = categoryRequest.Name;
                category.UpdatedAt = DateTime.UtcNow;

                var result = await _categoryServices.UpdateAsync(category);
                
                if (result)
                {
                    return Ok(new { message = "Category updated successfully." });
                }
                
                return BadRequest("Failed to update category.");
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the category.");
            }
        }
    }
}
