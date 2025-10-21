using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Mmo_Api.ApiController;

[Route("api/accounts")]
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
    [Authorize(Policy = "AdminOnly")]
    [EnableQuery]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAllAccounts()
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
            
            return Ok(userResponses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi khi lấy danh sách accounts: {ex.Message}");
        }
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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (request == null)
            {
                return BadRequest("Request body cannot be null");
            }

            if (string.IsNullOrEmpty(request.Username) && 
                string.IsNullOrEmpty(request.Email) && 
                string.IsNullOrEmpty(request.Phone))
            {
                return BadRequest("At least one field must be provided for update");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid token");
            }

            var result = await _accountServices.UpdateProfileAsync(userId, request);

            if (!result)
            {
                var account = await _accountServices.GetByIdAsync(userId);
                if (account == null)
                {
                    return NotFound("User not found");
                }

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
}