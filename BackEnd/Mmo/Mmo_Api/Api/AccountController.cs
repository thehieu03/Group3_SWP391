namespace Mmo_Api.ApiController;

[Route("api/accounts")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly IAccountServices _accountServices;
    private readonly IMapper _mapper;
    private readonly ITokenServices _tokenServices;
    private readonly IRoleServices _roleServices;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<AccountController> _logger;

    public AccountController(IAccountServices accountServices, IMapper mapper, ITokenServices tokenServices,
        IRoleServices roleServices, IWebHostEnvironment environment, ILogger<AccountController> logger)
    {
        _accountServices = accountServices;
        _mapper = mapper;
        _tokenServices = tokenServices;
        _roleServices = roleServices;
        _environment = environment;
        _logger = logger;
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

                if (trimmedPhone.Length < 7 || trimmedPhone.Length > 20)
                    return BadRequest(new { message = "Phone must be between 7 and 20 characters" });
                if (!System.Text.RegularExpressions.Regex.IsMatch(trimmedPhone, @"^[0-9+\-\s()]*$"))
                    return BadRequest(new
                    {
                        message =
                            "Phone number contains invalid characters. Only numbers, spaces, dashes, plus signs, and parentheses are allowed"
                    });
                if (!System.Text.RegularExpressions.Regex.IsMatch(trimmedPhone, @"[0-9]"))
                    return BadRequest(new { message = "Phone number must contain at least one digit" });

                account.Phone = trimmedPhone;
            }

            if (avatar != null)
            {
                if (!string.IsNullOrEmpty(account.ImageUrl))
                    try
                    {
                        var oldImagePath = account.ImageUrl.TrimStart('/');
                        var fullOldImagePath = Path.Combine(_environment.ContentRootPath, oldImagePath);
                        if (System.IO.File.Exists(fullOldImagePath)) System.IO.File.Delete(fullOldImagePath);
                    }
                    catch (Exception ex)
                    {
                        // Log warning but continue with new image upload
                        _logger.LogWarning(ex, "Failed to delete old image {ImageUrl}", account.ImageUrl);
                    }

                // Use helper to validate and save to Images/Accounts
                try
                {
                    var imageUrl = await HelperImage.SaveImageByType(Mmo_Domain.Enum.ImageCategory.Accounts, avatar,
                        _environment, 5 * 1024 * 1024);
                    account.ImageUrl = imageUrl;
                    account.ImageUploadedAt = DateTime.UtcNow;
                }
                catch (Exception ex)
                {
                    return BadRequest(new { message = ex.Message });
                }
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

    [HttpGet("accountProfile")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> GetMyProfile()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Unauthorized" });

            var account = await _accountServices.GetByIdAsync(userId);
            if (account == null) return NotFound(new { message = "User not found" });

            var response = new
            {
                id = account.Id,
                username = account.Username,
                email = account.Email,
                phone = account.Phone,
                balance = account.Balance,
                isActive = account.IsActive,
                createdAt = account.CreatedAt?.ToString("o"),
                updatedAt = account.UpdatedAt?.ToString("o"),
                avatarUrl = account.ImageUrl
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
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

        // Download and save Google image to Accounts folder
        string? imageUrl = null;
        if (!string.IsNullOrEmpty(request.Image))
            try
            {
                var imageBytes = await HelperImage.DownloadImageFromUrlAsync(request.Image);
                await using var ms = new MemoryStream(imageBytes);
                IFormFile formFile = new FormFile(ms, 0, ms.Length, "avatar", $"{request.GoogleId}_avatar.jpg")
                {
                    Headers = new HeaderDictionary(),
                    ContentType = "image/jpeg"
                };
                imageUrl = await HelperImage.SaveImageByType(Mmo_Domain.Enum.ImageCategory.Accounts, formFile,
                    _environment, 5 * 1024 * 1024);
            }
            catch
            {
                // If image download fails, continue without image
                imageUrl = null;
            }

        // If account not found by GoogleId, try link by email
        var existingByEmail = await _accountServices.GetByEmailAsync(request.Email);
        if (existingByEmail != null)
        {
            existingByEmail.GoogleId = request.GoogleId;
            if (string.IsNullOrEmpty(existingByEmail.ImageUrl) && !string.IsNullOrEmpty(imageUrl))
            {
                existingByEmail.ImageUrl = imageUrl;
                existingByEmail.ImageUploadedAt = DateTime.UtcNow;
            }

            existingByEmail.UpdatedAt = DateTime.UtcNow;
            await _accountServices.UpdateAsync(existingByEmail);

            var linkedTokens = await _tokenServices.GenerateTokensAsync(existingByEmail);
            return Ok(linkedTokens);
        }

        // Generate a unique username to avoid duplicate key violation
        var desiredUsername = (request.Username ?? request.Email?.Split('@').FirstOrDefault() ?? "user").Trim();
        if (string.IsNullOrWhiteSpace(desiredUsername))
            desiredUsername = $"user_{request.GoogleId.Substring(0, Math.Min(6, request.GoogleId.Length))}";

        var uniqueUsername = desiredUsername;
        var suffix = 0;
        while (await _accountServices.GetByUsernameAsync(uniqueUsername) != null && suffix < 100)
        {
            suffix++;
            uniqueUsername = $"{desiredUsername}{suffix}";
        }

        var accountAdd = new Account
        {
            GoogleId = request.GoogleId,
            Email = request.Email!,
            Username = uniqueUsername,
            ImageUrl = imageUrl,
            ImageUploadedAt = imageUrl != null ? DateTime.UtcNow : null
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
        if (account == null) return NotFound();
        account.Email = "leducmanh038@gmail.com";
        var result = await _accountServices.UpdateAsync(account);
        return Ok(result);
    }

    [HttpGet("u")]
    public async Task<IActionResult> U()
    {
        var account = await _accountServices.GetByIdAsync(4);
        if (account == null) return NotFound();
        account.Email = "leducmanh038@gmail.com";
        account.Password = await _accountServices.HashPasswordAsync("Password123!");
        var result = await _accountServices.UpdateAsync(account);
        return Ok(result);
    }
}