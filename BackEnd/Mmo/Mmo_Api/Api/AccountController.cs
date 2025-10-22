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
<<<<<<< Updated upstream
}
=======

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateAccount(int id, [FromBody] UserResponse request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (request == null)
            {
                return BadRequest("Request body cannot be null");
            }

            if (id <= 0)
            {
                return BadRequest("Invalid account ID");
            }

            var result = await _accountServices.UpdateAccountAsync(id, request);

            if (!result)
            {
                var account = await _accountServices.GetByIdAsync(id);
                if (account == null)
                {
                    return NotFound("Account not found");
                }

                return BadRequest("Update failed. Username or email may already exist");
            }

            return Ok(new { message = "Account updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteAccount(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest("Invalid account ID");
            }

            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserIdClaim) || !int.TryParse(currentUserIdClaim, out int currentUserId))
            {
                return Unauthorized("Invalid token");
            }

            var result = await _accountServices.DeleteAccountAsync(id, currentUserId);

            if (!result)
            {
                if (id == currentUserId)
                {
                    return BadRequest("Admin cannot delete their own account");
                }

                var account = await _accountServices.GetByIdAsync(id);
                if (account == null)
                {
                    return NotFound("Account not found");
                }

                return BadRequest("Failed to delete account");
            }

            return Ok(new { message = "Account deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            if (request == null)
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });

            if (string.IsNullOrWhiteSpace(request.OldPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest(new { message = "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới." });

            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int accountId))
                return Unauthorized(new { message = "Không tìm thấy thông tin người dùng trong token." });

            var result = await _accountServices.ChangePasswordAsync(accountId, request.OldPassword, request.NewPassword);

            if (!result)
                return BadRequest(new { message = "Đổi mật khẩu thất bại. Mật khẩu cũ không chính xác hoặc lỗi xử lý." });

            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi hệ thống khi đổi mật khẩu: {ex.Message}" });
        }
    }
}
>>>>>>> Stashed changes
