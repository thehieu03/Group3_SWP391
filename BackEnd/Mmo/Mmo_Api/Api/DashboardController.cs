namespace Mmo_Api.Api;

[Route("api/dashboard")]
[ApiController]
[Authorize]
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
    [Authorize(Policy = "AdminOnly")]
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

    [HttpGet("seller-overview")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Policy = "AdminOrSeller")]
    public async Task<ActionResult<SellerDashboardResponse>> GetSellerDashboardOverview(
        [FromQuery] string? searchTerm = null, 
        [FromQuery] string? statusFilter = null,
        [FromQuery] int? categoryFilter = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid token");
            }

            var sellerData = await _dashboardServices.GetSellerDashboardAsync(userId, searchTerm, statusFilter, categoryFilter, page, pageSize);
            return Ok(sellerData);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}