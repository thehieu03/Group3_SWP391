using Mmo_Application.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Mmo_Api.Api;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAccountServices _accountServices;
    private readonly ITokenServices _tokenServices;
    private readonly IMapper _mapper;

    public AuthController(IAccountServices accountServices, ITokenServices tokenServices, IMapper mapper)
    {
        _accountServices = accountServices;
        _tokenServices = tokenServices;
        _mapper = mapper;
    }

    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest loginRequest)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var account =  await _accountServices.GetByEmailAsync(loginRequest.Username);

            if (account == null) return Unauthorized("Invalid username or password");

            if (account.IsActive != true) return Unauthorized("Account is deactivated");

            if (!await _accountServices.VerifyPasswordAsync(account, loginRequest.Password))
                return Unauthorized("Invalid username or password");

            var authResponse = await _tokenServices.GenerateTokensAsync(account);

            return Ok(authResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("refresh")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RefreshTokenResponse>> Refresh([FromBody] RefreshTokenRequest refreshRequest)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var refreshResponse = await _tokenServices.RefreshTokenAsync(refreshRequest.RefreshToken);

            if (refreshResponse == null) return Unauthorized("Invalid or expired refresh token");

            return Ok(refreshResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Logout([FromBody] RefreshTokenRequest refreshRequest)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _tokenServices.RevokeTokenAsync(refreshRequest.RefreshToken);

            if (!result) return BadRequest("Failed to revoke token");

            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("validate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> ValidateToken()
    {
        try
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token)) return Unauthorized("Token not provided");

            var isValid = await _tokenServices.IsTokenValidAsync(token);

            if (!isValid) return Unauthorized("Invalid or expired token");

            return Ok(new { message = "Token is valid" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [Authorize]
    public async Task<ActionResult<AccountResponse>> GetCurrentUser()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid token");

            var account = await _accountServices.GetByIdAsync(userId);
            if (account == null) return Unauthorized("User not found");

            var roles = await _accountServices.GetUserRolesAsync(userId);

            var userResponse = new AccountResponse
            {
                Id = account.Id,
                Username = account.Username,
                Email = account.Email,
                Phone = account.Phone,
                Balance = account.Balance,
                IsActive = account.IsActive,
                CreatedAt = account.CreatedAt,
                Roles = roles
            };

            return Ok(userResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
