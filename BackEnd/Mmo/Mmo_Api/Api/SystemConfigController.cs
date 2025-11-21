using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;
using System.Security.Claims;

namespace Mmo_Api.Api;

[Route("api/system-config")]
[ApiController]
[Authorize]
public class SystemConfigController : ControllerBase
{
    private readonly ISystemsconfigServices _systemsconfigServices;

    public SystemConfigController(ISystemsconfigServices systemsconfigServices)
    {
        _systemsconfigServices = systemsconfigServices;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<SystemsConfigResponse>> GetSystemConfig()
    {
        try
        {
            var configs = await _systemsconfigServices.GetAllAsync();
            var config = configs.FirstOrDefault();
            
            if (config == null)
            {
                return NotFound("System configuration not found");
            }

            var response = new SystemsConfigResponse
            {
                Email = config.Email,
                Fee = config.Fee,
                GoogleAppPassword = "********" // Mask password for security
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> UpdateSystemConfig([FromBody] SystemConfigRequest request)
    {
        try
        {
            if (request == null)
            {
                return BadRequest("Request body is required");
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest("Email is required");
            }

            // GoogleAppPassword is optional - if not provided or masked, keep current password

            var result = await _systemsconfigServices.UpdateSystemConfigAsync(request);
            
            if (result)
            {
                return Ok(new { message = "System configuration updated successfully" });
            }

            return StatusCode(500, "Failed to update system configuration");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}

