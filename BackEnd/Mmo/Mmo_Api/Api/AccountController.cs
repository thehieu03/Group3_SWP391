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


    [HttpPut("profile")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateProfile([FromBody] ProfileUpdateRequest request)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (request == null) return BadRequest("Request body cannot be null");

            if (string.IsNullOrEmpty(request.Username) &&
                string.IsNullOrEmpty(request.Email) &&
                string.IsNullOrEmpty(request.Phone))
                return BadRequest("At least one field must be provided for update");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid token");

            var result = await _accountServices.UpdateProfileAsync(userId, request);

            if (!result)
            {
                var account = await _accountServices.GetByIdAsync(userId);
                if (account == null) return NotFound("User not found");

                return BadRequest("Update failed. Username or email may already exist");
            }

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
}