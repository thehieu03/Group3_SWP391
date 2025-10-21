using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;

namespace Mmo_Api.Api;

[Route("api/systemsconfig")]
[ApiController]
public class SystemsconfigController : ControllerBase
{
    private readonly ISystemsconfigServices _systemsconfigServices;

    public SystemsconfigController(ISystemsconfigServices systemsconfigServices)
    {
        _systemsconfigServices = systemsconfigServices;
    }

    /// <summary>
    /// Lấy cấu hình hệ thống
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<SystemsConfigResponse>> GetSystemConfig()
    {
        try
        {
            var config = await _systemsconfigServices.GetSystemConfigAsync();

            if (config == null)
            {
                return NotFound("System configuration not found");
            }

            var response = new SystemsConfigResponse
            {
                Email = config.Email,
                Fee = config.Fee,
                GoogleAppPassword = config.GoogleAppPassword
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Cập nhật cấu hình hệ thống
    /// </summary>
    [HttpPut]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> UpdateSystemConfig([FromBody] UpdateSystemConfigRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _systemsconfigServices.UpdateSystemConfigAsync(request);

            if (!result)
            {
                return BadRequest("Failed to update system configuration");
            }

            return Ok(new { message = "System configuration updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}

