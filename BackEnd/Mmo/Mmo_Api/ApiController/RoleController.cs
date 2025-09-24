using Mmo_Application.Services.Interface;
using Mmo_Domain.Models;

namespace Mmo_Api.ApiController;

[Route("api/role")]
[ApiController]
[Produces("application/json")]
public class RoleController : ControllerBase
{
    private readonly IRoleServices _roleServices;

    public RoleController(IRoleServices roleServices)
    {
        _roleServices = roleServices;
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(IEnumerable<Role>), StatusCodes.Status200OK)]
    [HttpGet]
    public async Task<ActionResult<Role>> Get()
    {
        var result = await _roleServices.GetAllAsync();
        return result == null ? BadRequest() : Ok(result);
    }
}