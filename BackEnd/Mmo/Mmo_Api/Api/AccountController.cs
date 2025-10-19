using Microsoft.AspNetCore.Mvc;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;
using System.Threading.Tasks;

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
        public async Task<IActionResult> Register([FromBody] AccountRegisterRequest request)
        {
            var result = await _accountServices.RegisterAsync(request);

            if (result.Success)
            {
                return Ok(result); // Trả về 200 OK
            }

            // Trả về 400 Bad Request kèm thông báo lỗi (vd: "Email đã tồn tại")
            return BadRequest(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AccountLoginRequest request)
        {
            var result = await _accountServices.LoginAsync(request);

            if (result.Success)
            {
                return Ok(result); 
            }

            return BadRequest(result);
        }
    }
}