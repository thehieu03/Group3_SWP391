using Microsoft.AspNetCore.Mvc;
using Mmo_Application.Services.Interface;
using AutoMapper;
using Mmo_Domain.Models;

namespace Mmo_Api.ApiController
{
    [Route("api/accounts")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountServices _accountServices;
        private readonly IMapper _mapper;

        public AccountController(IAccountServices accountServices, IMapper mapper)
        {
            _accountServices = accountServices;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<Account>>> GetAllAccounts()
        {
            try
            {
                var accounts = await _accountServices.GetAllAsync();
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi lấy danh sách accounts: {ex.Message}");
            }
        }

        // 🔽 🔽 🔽 Thêm mới: API đổi mật khẩu (POST /api/accounts/change-password)
        [HttpPost("change-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                // ✅ Lấy accountId từ JWT Token
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
                if (userIdClaim == null)
                    return Unauthorized(new { message = "Không tìm thấy thông tin người dùng trong token." });

                int accountId = int.Parse(userIdClaim.Value);

                var result = await _accountServices.ChangePasswordAsync(accountId, request.OldPassword, request.NewPassword);

                if (!result)
                    return BadRequest(new { message = "Đổi mật khẩu thất bại. Kiểm tra lại thông tin." });

                return Ok(new { message = "Đổi mật khẩu thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi đổi mật khẩu: {ex.Message}" });
            }
        }
    }

    // DTO yêu cầu đổi mật khẩu
    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
