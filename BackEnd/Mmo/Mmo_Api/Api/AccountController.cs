using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Mmo_Api.Helper;

namespace Mmo_Api.ApiController;

[Route("api/accounts")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly IAccountServices _accountServices;
    private readonly IMapper _mapper;
    private readonly ITokenServices _tokenServices;
    private readonly IRoleServices _roleServices;

    public AccountController(IAccountServices accountServices, IMapper mapper, ITokenServices tokenServices,
        IRoleServices roleServices)
    {
        _accountServices = accountServices;
        _mapper = mapper;
        _tokenServices = tokenServices;
        _roleServices = roleServices;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [EnableQuery]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserListResponse>> GetAllAccounts()
    {
        try
        {
            var accounts = await _accountServices.GetAllAsync();
            var userResponses = new List<UserResponse>();

            foreach (var account in accounts)
            {
                var userResponse = _mapper.Map<UserResponse>(account);

                var roles = await _accountServices.GetUserRolesAsync(account.Id);
                userResponse.Roles = roles;

                userResponses.Add(userResponse);
            }

            var statistics = await _accountServices.GetUserStatisticsAsync();

            var response = new UserListResponse
            {
                Users = userResponses,
                Statistics = statistics
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi khi lấy danh sách accounts: {ex.Message}");
        }
    }

    [HttpPost("registerDefault")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterDefaultAccount([FromBody] RegisterRequest registerDefault)
    {
        if (!ModelState.IsValid) return BadRequest();
        var passWordHard = await _accountServices.HashPasswordAsync(registerDefault.Password);
        var account = _mapper.Map<Account>(registerDefault);
        account.Password = passWordHard;
        var result = await _accountServices.AddAsync(account);
        return result > 0 ? Ok(result) : BadRequest();
    }


    [HttpPut("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Unauthorized" });

            var (ok, error) =
                await _accountServices.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
            if (!ok)
            {
                if (error == "Mật khẩu hiện tại không đúng" ||
                    error == "Mật khẩu mới không được trùng mật khẩu hiện tại")
                    return BadRequest(new { message = error });
                if (error == "Unauthorized") return Unauthorized(new { message = error });
                return StatusCode(500, new { message = error ?? "Cập nhật thất bại" });
            }

            return Ok(new { message = "Đổi mật khẩu thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
    }

    [HttpPut("profile")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateProfile(
        [FromForm] string? username,
        [FromForm] string? phone,
        [FromForm] IFormFile? avatar)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(username) && string.IsNullOrWhiteSpace(phone) && avatar == null)
                return BadRequest(new { message = "At least one field must be provided for update" });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid token");

            var account = await _accountServices.GetByIdAsync(userId);
            if (account == null) return NotFound(new { message = "User not found" });

            if (!string.IsNullOrWhiteSpace(username))
            {
                if (username.Length < 3 || username.Length > 50)
                    return BadRequest(new { message = "Username must be between 3 and 50 characters" });
                account.Username = username.Trim();
            }

            if (!string.IsNullOrWhiteSpace(phone))
            {
                var trimmedPhone = phone.Trim();

                // Length validation
                if (trimmedPhone.Length < 7 || trimmedPhone.Length > 20)
                    return BadRequest(new { message = "Phone must be between 7 and 20 characters" });

                // Format validation: only numbers, spaces, dashes, plus signs, and parentheses
                if (!System.Text.RegularExpressions.Regex.IsMatch(trimmedPhone, @"^[0-9+\-\s()]*$"))
                    return BadRequest(new
                    {
                        message =
                            "Phone number contains invalid characters. Only numbers, spaces, dashes, plus signs, and parentheses are allowed"
                    });

                // Must contain at least one digit
                if (!System.Text.RegularExpressions.Regex.IsMatch(trimmedPhone, @"[0-9]"))
                    return BadRequest(new { message = "Phone number must contain at least one digit" });

                account.Phone = trimmedPhone;
            }

            if (avatar != null)
            {
                if (!avatar.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "Avatar must be an image" });
                const long maxSize = 5 * 1024 * 1024;
                if (avatar.Length > maxSize)
                    return BadRequest(new { message = "Avatar size must be ≤ 5MB" });

                await using var ms = new MemoryStream();
                await avatar.CopyToAsync(ms);
                account.Image = ms.ToArray();
            }

            account.UpdatedAt = DateTime.UtcNow;
            var saved = await _accountServices.UpdateAsync(account);
            if (!saved) return StatusCode(500, new { message = "Failed to update profile" });

            return Ok(new { message = "Profile updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

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
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (request == null) return BadRequest("Request body cannot be null");

            if (id <= 0) return BadRequest("Invalid account ID");

            var result = await _accountServices.UpdateAccountAsync(id, request);

            if (!result)
            {
                var account = await _accountServices.GetByIdAsync(id);
                if (account == null) return NotFound("Account not found");

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
            if (id <= 0) return BadRequest("Invalid account ID");

            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserIdClaim) || !int.TryParse(currentUserIdClaim, out var currentUserId))
                return Unauthorized("Invalid token");

            var result = await _accountServices.DeleteAccountAsync(id, currentUserId);

            if (!result)
            {
                if (id == currentUserId) return BadRequest("Admin cannot delete their own account");

                var account = await _accountServices.GetByIdAsync(id);
                if (account == null) return NotFound("Account not found");

                return BadRequest("Failed to delete account");
            }

            return Ok(new { message = "Account deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{userId}/role")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateAccountRoles(int userId, [FromBody] UpdateAccountRoleRequest request)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (request == null) return BadRequest("Request body cannot be null");

            if (userId <= 0) return BadRequest("Invalid user ID");

            if (request.UserId != userId) return BadRequest("User ID in URL and request body must match");
            if (request.RoleIds == null) return Ok(new { message = "No roles to update" });
            if (!request.RoleIds.Any())
            {
                var currentRoleIds = await _accountServices.GetUserRoleIdsAsync(userId);
                if (currentRoleIds.Any()) await _accountServices.RemoveAccountRolesAsync(userId, currentRoleIds);
                return Ok(new { message = "All roles removed successfully" });
            }

            var result =
                await _accountServices.UpdateAccountRolesAdvancedAsync(userId, request.RoleIds, request.ReplaceAll);

            if (!result)
            {
                var account = await _accountServices.GetByIdAsync(userId);
                if (account == null) return NotFound("User not found");

                return BadRequest("Failed to update account roles");
            }

            var message = request.ReplaceAll
                ? "Account roles replaced successfully"
                : "Account roles updated successfully";
            return Ok(new { message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{userId}/role")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> RemoveAccountRoles(int userId, [FromBody] UpdateAccountRoleRequest request)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (request == null) return BadRequest("Request body cannot be null");

            if (userId <= 0) return BadRequest("Invalid user ID");

            if (request.UserId != userId) return BadRequest("User ID in URL and request body must match");

            if (request.RoleIds == null || !request.RoleIds.Any()) return Ok(new { message = "No roles to remove" });

            var result = await _accountServices.RemoveAccountRolesAsync(userId, request.RoleIds);

            if (!result)
            {
                var account = await _accountServices.GetByIdAsync(userId);
                if (account == null) return NotFound("User not found");

                return BadRequest("Failed to remove account roles");
            }

            return Ok(new { message = "Account roles removed successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("{userId}/roles")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> GetUserRoles(int userId)
    {
        try
        {
            var roles = await _accountServices.GetUserRolesAsync(userId);
            var roleIds = await _accountServices.GetUserRoleIdsAsync(userId);

            return Ok(new
            {
                roles = roles,
                roleIds = roleIds
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{userId}/status")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateUserStatus(int userId, [FromBody] UpdateUserStatusRequest request)
    {
        try
        {
            if (request == null) return BadRequest(new { message = "Request body cannot be null" });

            if (request.UserId != userId)
                return BadRequest(new { message = "User ID in URL and request body must match" });

            if (userId <= 0) return BadRequest(new { message = "Invalid user ID" });
            var account = await _accountServices.GetByIdAsync(userId);
            if (account == null) return NotFound(new { message = "User not found" });
            var result = await _accountServices.UpdateUserStatusAsync(userId, request.IsActive);

            if (!result) return StatusCode(500, new { message = "Failed to update user status" });

            var action = request.IsActive ? "unbanned" : "banned";
            var message = $"User {action} successfully";

            return Ok(new { message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
    }

    [HttpPost("google")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> LoginOrRegisterGoogle([FromBody] RegisterWithGoogleRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var account = await _accountServices.CheckAccountByGoogleId(request.GoogleId);
        if (account != null)
        {
            var authResponse = await _tokenServices.GenerateTokensAsync(account);
            return Ok(authResponse);
        }

        var accountAdd = new Account
        {
            GoogleId = request.GoogleId,
            Email = request.Email,
            Username = request.Username,
            Image = await HelperImage.DownloadImageFromUrlAsync(request.Image)
        };
        var addAccount = await _accountServices.AddAsync(accountAdd);
        try
        {
            var roles = await _roleServices.GetAllAsync();
            var customerRoleId = roles.FirstOrDefault(r => r.RoleName == "CUSTOMER")?.Id ?? 0;
            if (customerRoleId > 0 && accountAdd.Id > 0)
                await _accountServices.UpdateAccountRolesAsync(accountAdd.Id, new List<int> { customerRoleId });
        }
        catch
        {
            // Swallow role assignment errors to not block Google login/registration
        }

        var tokens = await _tokenServices.GenerateTokensAsync(accountAdd);
        return Ok(tokens);
    }

    [HttpGet("updateTestAccount")]
    public async Task<IActionResult> UpdateEmailAccount()
    {
        var account = await _accountServices.GetByIdAsync(4);
        account.Email = "quanhzero@gmail.com";
        var result = await _accountServices.UpdateAsync(account);
        return Ok(result);
    }

    /// <summary>
    /// Cập nhật thông tin profile của user hiện tại
    /// </summary>
    /// <param name="request">Thông tin cần cập nhật</param>
    /// <returns>Kết quả cập nhật</returns>
    [HttpPut("profile")]
    [Authorize] // Yêu cầu authentication
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateProfile([FromBody] ProfileUpdateRequest request)
    {
        try
        {
            // Kiểm tra model validation
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra request body
            if (request == null)
            {
                return BadRequest("Request body cannot be null");
            }

            // Kiểm tra ít nhất một field được cập nhật
            if (string.IsNullOrEmpty(request.Username) && 
                string.IsNullOrEmpty(request.Email) && 
                string.IsNullOrEmpty(request.Phone))
            {
                return BadRequest("At least one field must be provided for update");
            }

            // Lấy user ID từ JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid token");
            }

            // Cập nhật profile
            var result = await _accountServices.UpdateProfileAsync(userId, request);

            if (!result)
            {
                // Kiểm tra xem user có tồn tại không
                var account = await _accountServices.GetByIdAsync(userId);
                if (account == null)
                {
                    return NotFound("User not found");
                }

                // Nếu user tồn tại nhưng update thất bại, có thể do username/email đã tồn tại
                return BadRequest("Update failed. Username or email may already exist");
            }

            return Ok(new { message = "Profile updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}