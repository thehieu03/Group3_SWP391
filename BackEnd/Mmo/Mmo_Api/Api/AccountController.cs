using Microsoft.AspNetCore.Mvc;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;

namespace Mmo_Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountServices _accountServices;

        public AccountController(IAccountServices accountServices)
        {
            _accountServices = accountServices;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] AccountRequest request)
        {
            if (request == null)
                return BadRequest("Dữ liệu không hợp lệ!");

            var result = await _accountServices.RegisterAsync(request);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AccountRequest request)
        {
            if (request == null)
                return BadRequest("Dữ liệu không hợp lệ!");

            var result = await _accountServices.LoginAsync(request);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
