using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Mmo_Application.Services.Interface;
using Mmo_Domain.Models;
using Mmo_Domain.ModelResponse;
using Microsoft.AspNetCore.Authorization;

namespace Mmo_Api.Api;

[Route("api/shops")]
[ApiController]
public class ShopController : ControllerBase
{
	private readonly IShopServices _shopServices;
	private readonly IMapper _mapper;

	public ShopController(IShopServices shopServices, IMapper mapper)
	{
		_shopServices = shopServices;
		_mapper = mapper;
	}

	[HttpGet]
	[Authorize(Policy = "AdminOnly")]
	[EnableQuery]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status401Unauthorized)]
	[ProducesResponseType(StatusCodes.Status403Forbidden)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<ActionResult<IEnumerable<ShopResponse>>> GetAll()
	{
		try
		{
			var shops = await _shopServices.GetAllAsync();
			if (!shops.Any())
			{
				return NotFound("No shops found");
			}

			var shopResponses = new List<ShopResponse>();
			foreach (var shop in shops)
			{
				var shopResponse = _mapper.Map<ShopResponse>(shop);
				shopResponse.OwnerUsername = shop.Account?.Username;
				shopResponse.ProductCount = shop.Products?.Count ?? 0;
				shopResponses.Add(shopResponse);
			}

			return Ok(shopResponses);
		}
		catch (Exception ex)
		{
			return StatusCode(500, $"Internal server error: {ex.Message}");
		}
	}

	[HttpGet("{id}")]
	[Authorize(Policy = "AdminOnly")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status401Unauthorized)]
	[ProducesResponseType(StatusCodes.Status403Forbidden)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<ActionResult<ShopResponse>> GetById(int id)
	{
		try
		{
			var shop = await _shopServices.GetByIdAsync(id);
			if (shop == null)
			{
				return NotFound("Shop not found");
			}

			var shopResponse = _mapper.Map<ShopResponse>(shop);
			shopResponse.OwnerUsername = shop.Account?.Username;
			shopResponse.ProductCount = shop.Products?.Count ?? 0;

			return Ok(shopResponse);
		}
		catch (Exception ex)
		{
			return StatusCode(500, $"Internal server error: {ex.Message}");
		}
	}

	[HttpPost]
	[Authorize(Policy = "AdminOnly")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[ProducesResponseType(StatusCodes.Status401Unauthorized)]
	[ProducesResponseType(StatusCodes.Status403Forbidden)]
	public async Task<IActionResult> Create([FromBody] Shop shop)
	{
		try
		{
			if (shop == null || !ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			shop.CreatedAt = DateTime.UtcNow;
			shop.IsActive = true;
			var result = await _shopServices.AddAsync(shop);
			
			return result > 0 ? Ok(new { message = "Shop created successfully", id = result }) : BadRequest("Failed to create shop");
		}
		catch (Exception ex)
		{
			return StatusCode(500, $"Internal server error: {ex.Message}");
		}
	}

	[HttpPut("{id}")]
	[Authorize(Policy = "AdminOnly")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[ProducesResponseType(StatusCodes.Status401Unauthorized)]
	[ProducesResponseType(StatusCodes.Status403Forbidden)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> Update(int id, [FromBody] Shop request)
	{
		try
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			var shop = await _shopServices.GetByIdAsync(id);
			if (shop == null)
			{
				return NotFound("Shop not found");
			}

			shop.Name = string.IsNullOrWhiteSpace(request.Name) ? shop.Name : request.Name;
			shop.Description = request.Description ?? shop.Description;
			shop.IsActive = request.IsActive ?? shop.IsActive;
			shop.UpdatedAt = DateTime.UtcNow;

			var updated = await _shopServices.UpdateAsync(shop);
			return updated ? Ok(new { message = "Shop updated successfully" }) : BadRequest("Failed to update shop");
		}
		catch (Exception ex)
		{
			return StatusCode(500, $"Internal server error: {ex.Message}");
		}
	}

	[HttpDelete("{id}")]
	[Authorize(Policy = "AdminOnly")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status401Unauthorized)]
	[ProducesResponseType(StatusCodes.Status403Forbidden)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> Delete(int id)
	{
		try
		{
			var shop = await _shopServices.GetByIdAsync(id);
			if (shop == null)
			{
				return NotFound("Shop not found");
			}

			var deleted = await _shopServices.DeleteAsync(shop);
			return deleted ? Ok(new { message = "Shop deleted successfully" }) : BadRequest("Failed to delete shop");
		}
		catch (Exception ex)
		{
			return StatusCode(500, $"Internal server error: {ex.Message}");
		}
	}
}
