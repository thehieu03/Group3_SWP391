using Microsoft.AspNetCore.OData.Query;
using Mmo_Application.Services.Interface;

namespace Mmo_Api.ApiController;

[Route("api/account")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly IAccountServices _accountServices;
    private readonly IMapper _mapper;

    public AccountController(IAccountServices accountServices,IMapper mapper)
    {
        _accountServices = accountServices;
        _mapper = mapper;
    }
    [HttpGet]
    [EnableQuery]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAllAccounts()
    {
        var accounts = await _accountServices.GetAllAsync();
        return Ok(accounts);
    }
}