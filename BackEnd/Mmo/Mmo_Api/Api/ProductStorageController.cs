using Mmo_Domain.ModelRequest;
using Mmo_Application.Services.Interface;

namespace Mmo_Api.Api;

[Route("api/productStorage")]
[ApiController]
public class ProductStorageController : ControllerBase
{
    private readonly IProductStorageServices _productStorageServices;
    private readonly ILogger<ProductStorageController>? _logger;

    public ProductStorageController(
        IProductStorageServices productStorageServices,
        ILogger<ProductStorageController>? logger = null)
    {
        _productStorageServices = productStorageServices;
        _logger = logger;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateProductStorage([FromBody] ProductStorageRequest request)
    {
        _logger?.LogInformation("CreateProductStorage called with Request: {@Request}", new
        {
            request?.ProductVariantId,
            AccountCount = request?.Accounts?.Count ?? 0
        });

        if (request == null)
        {
            _logger?.LogWarning("CreateProductStorage: request is null");
            return BadRequest(new { message = "Request is null" });
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .Select(x => new { Field = x.Key, Errors = x.Value?.Errors.Select(e => e.ErrorMessage) });
            _logger?.LogWarning("CreateProductStorage: ModelState is invalid. Errors: {@Errors}", errors);
            return BadRequest(new { message = "Invalid request data", errors });
        }

        try
        {
            // Create product storages (validation và logic được thực hiện trong service)
            var (success, errorMessage, storageCount) = await _productStorageServices.CreateProductStoragesAsync(request);
            
            if (!success)
            {
                _logger?.LogWarning("CreateProductStorage: Failed to create storages for ProductVariantId: {ProductVariantId}. Error: {Error}", 
                    request.ProductVariantId, errorMessage);
                return BadRequest(new { message = errorMessage ?? "Failed to create product storages" });
            }

            _logger?.LogInformation("CreateProductStorage: Successfully created {Count} storages for ProductVariantId: {ProductVariantId}", 
                storageCount, request.ProductVariantId);

            return Ok(new { 
                message = "Product storages created successfully", 
                productVariantId = request.ProductVariantId,
                accountCount = request.Accounts.Count,
                storageCount = storageCount
            });
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "CreateProductStorage: Error creating product storages");
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    [HttpGet("variant/{productVariantId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProductStoragesByVariantId(int productVariantId)
    {
        _logger?.LogInformation("GetProductStoragesByVariantId called with ProductVariantId: {ProductVariantId}", productVariantId);

        try
        {
            var storages = await _productStorageServices.GetStoragesByVariantIdAsync(productVariantId);
            if (storages == null || !storages.Any())
            {
                return NotFound(new { message = "No storages found for this product variant" });
            }

            return Ok(new { 
                productVariantId = productVariantId,
                count = storages.Count(),
                storages = storages.Select(s => new { s.Id, s.Result })
            });
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "GetProductStoragesByVariantId: Error getting product storages");
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    [HttpPut("{storageId}/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStorageStatus(int storageId, [FromBody] UpdateStorageStatusRequest request)
    {
        _logger?.LogInformation("UpdateStorageStatus called with StorageId: {StorageId}, Status: {Status}", 
            storageId, request?.Status);

        if (request == null || storageId != request.StorageId)
        {
            return BadRequest(new { message = "Invalid request" });
        }

        try
        {
            // Update storage status (logic được thực hiện trong service)
            var (success, errorMessage) = await _productStorageServices.UpdateStorageStatusAsync(storageId, request);
            
            if (!success)
            {
                _logger?.LogWarning("UpdateStorageStatus: Failed to update storage {StorageId}. Error: {Error}", 
                    storageId, errorMessage);
                
                if (errorMessage?.Contains("not found") == true)
                    return NotFound(new { message = errorMessage });
                
                return BadRequest(new { message = errorMessage ?? "Failed to update storage status" });
            }

            _logger?.LogInformation("UpdateStorageStatus: Successfully updated storage {StorageId} with status {Status}", 
                storageId, request.Status);

            return Ok(new { 
                message = "Storage status updated successfully",
                storageId = storageId,
                status = request.Status
            });
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "UpdateStorageStatus: Error updating storage status");
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }
}

