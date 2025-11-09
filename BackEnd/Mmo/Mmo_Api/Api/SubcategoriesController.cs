using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.Models;
using AutoMapper;

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
    public async Task<ActionResult<IEnumerable<SubcategoryResponse>>> GetAll([FromQuery] int? categoryId, [FromQuery] bool includeInactive = false)
    {
        var subcategories = await _subcategoryServices.GetAllAsync();
        
        if (!includeInactive)
        {
            subcategories = subcategories.Where(s => s.IsActive == true);
        }
        
        if (categoryId.HasValue)
        {
            subcategories = subcategories.Where(s => s.CategoryId == categoryId.Value);
        }

        if (!subcategories.Any()) return NotFound();

        var dataResponse = _mapper.Map<IEnumerable<SubcategoryResponse>>(subcategories);
        return Ok(dataResponse);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(SubcategoryResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<SubcategoryResponse>> CreateSubcategory([FromBody] SubcategoryRequest subcategoryRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var subcategory = _mapper.Map<Subcategory>(subcategoryRequest);
            subcategory.IsActive = true;
            subcategory.CreatedAt = DateTime.UtcNow;

            var result = await _subcategoryServices.AddAsync(subcategory);
            
            if (result > 0)
            {
                var response = _mapper.Map<SubcategoryResponse>(subcategory);
                return Ok(response);
            }
            
            return BadRequest("Failed to create subcategory.");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error creating subcategory: {ex.Message}");
        }
    }

    [HttpPut("deactivate/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateSubcategory(int id)
    {
        try
        {
            var subcategory = await _subcategoryServices.GetByIdAsync(id);
            if (subcategory == null)
            {
                return NotFound("Subcategory not found.");
            }

            subcategory.IsActive = false;
            subcategory.UpdatedAt = DateTime.UtcNow;

            var result = await _subcategoryServices.UpdateAsync(subcategory);
            
            if (result)
            {
                return Ok(new { message = "Subcategory deactivated successfully." });
            }
            
            return BadRequest("Failed to deactivate subcategory.");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error deactivating subcategory: {ex.Message}");
        }
    }

    [HttpPut("activate/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActivateSubcategory(int id)
    {
        try
        {
            var subcategory = await _subcategoryServices.GetByIdAsync(id);
            if (subcategory == null)
            {
                return NotFound("Subcategory not found.");
            }

            subcategory.IsActive = true;
            subcategory.UpdatedAt = DateTime.UtcNow;

            var result = await _subcategoryServices.UpdateAsync(subcategory);
            
            if (result)
            {
                return Ok(new { message = "Subcategory activated successfully." });
            }
            
            return BadRequest("Failed to activate subcategory.");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error activating subcategory: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSubcategory(int id, [FromBody] SubcategoryRequest subcategoryRequest)
    {
        if (id <= 0)
            return BadRequest("Invalid subcategory ID.");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var subcategory = await _subcategoryServices.GetByIdAsync(id);
            if (subcategory == null)
            {
                return NotFound("Subcategory not found.");
            }

            subcategory.Name = subcategoryRequest.Name;
            subcategory.UpdatedAt = DateTime.UtcNow;

            var result = await _subcategoryServices.UpdateAsync(subcategory);
            
            if (result)
            {
                return Ok(new { message = "Subcategory updated successfully." });
            }
            
            return BadRequest("Failed to update subcategory.");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error updating subcategory: {ex.Message}");
        }
    }
}


