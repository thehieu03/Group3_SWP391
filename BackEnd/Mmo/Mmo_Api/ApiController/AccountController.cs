using Mmo_Application.Services.Interface;

namespace Mmo_Api.ApiController;

[Route("api/[controller]")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly IAccountServices _accountServices;

    public AccountController(IAccountServices accountServices)
    {
                                                              _accountServices = accountServices;
    }
    [HttpGet]
    public async Task<IActionResult> GetAllAccounts()
    {
        var accounts = await _accountServices.GetAllAsync();
        return Ok(accounts);
    }
}