using Mmo_Application.Services.Interface;
using Mmo_Domain.Models;

namespace Mmo_Api.ApiController;

[Route("api/roles")]
[ApiController]
[Produces("application/json")]
public class RoleController : ControllerBase
{
    private readonly IRoleServices _roleServices;
    private readonly IMapper _mapper;

    public RoleController(IRoleServices roleServices, IMapper mapper)
    {
        _roleServices = roleServices;
        _mapper = mapper;
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(List<Role>), StatusCodes.Status200OK)]
    [HttpGet]
    public async Task<ActionResult<List<Role>>> Get()
    {
        var result = await _roleServices.GetAllAsync();
        return result == null ? BadRequest() : Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(Role), StatusCodes.Status200OK)]
    public async Task<ActionResult<Role>> GetById(int id)
    {
        if (id <= 0) return BadRequest("Invalid ID");

        var result = await _roleServices.GetByIdAsync(id);
        if (result == null) return NotFound($"Role with ID {id} not found.");

        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Role>> Create([FromBody] RoleRequest roleRequest)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var roleAdd = _mapper.Map<Role>(roleRequest);
        var createdRole = await _roleServices.AddAsync(roleAdd);
        return createdRole > 0 ? Ok(createdRole) : BadRequest("Failed to create role.");
    }
}
