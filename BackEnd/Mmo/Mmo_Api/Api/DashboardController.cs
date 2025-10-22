using Microsoft.AspNetCore.Mvc;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelResponse;
using Microsoft.AspNetCore.Authorization;

namespace Mmo_Api.Api;

[Route("api/dashboard")]
[ApiController]
[Authorize(Policy = "AdminOnly")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardServices _dashboardServices;

    public DashboardController(IDashboardServices dashboardServices)
    {
        _dashboardServices = dashboardServices;
    }

    [HttpGet("overview")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<DashboardResponse>> GetDashboardOverview()
    {
        try
        {
            var dashboardData = await _dashboardServices.GetDashboardDataAsync();
            return Ok(dashboardData);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
