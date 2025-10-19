using Microsoft.AspNetCore.Mvc;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;
using Mmo_Domain.Models;
using AutoMapper;

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

    /// <summary>
    /// Đăng nhập và tạo token
    /// </summary>
    /// <param name="loginRequest">Thông tin đăng nhập</param>
    /// <returns>Token và thông tin user</returns>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest loginRequest)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Tìm user theo username hoặc email
            var account = await _accountServices.GetByUsernameAsync(loginRequest.Username) 
                         ?? await _accountServices.GetByEmailAsync(loginRequest.Username);

            if (account == null)
            {
                return Unauthorized("Invalid username or password");
            }

            // Kiểm tra tài khoản có active không
            if (account.IsActive != true)
            {
                return Unauthorized("Account is deactivated");
            }

            // Verify password
            if (!await _accountServices.VerifyPasswordAsync(account, loginRequest.Password))
            {
                return Unauthorized("Invalid username or password");
            }

            // Tạo token
            var authResponse = await _tokenServices.GenerateTokensAsync(account);
            
            return Ok(authResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Refresh token khi access token hết hạn
    /// </summary>
    /// <param name="refreshRequest">Refresh token</param>
    /// <returns>Token mới</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RefreshTokenResponse>> Refresh([FromBody] RefreshTokenRequest refreshRequest)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var refreshResponse = await _tokenServices.RefreshTokenAsync(refreshRequest.RefreshToken);
            
            if (refreshResponse == null)
            {
                return Unauthorized("Invalid or expired refresh token");
            }

            return Ok(refreshResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Đăng xuất và thu hồi token
    /// </summary>
    /// <param name="refreshRequest">Refresh token cần thu hồi</param>
    /// <returns>Kết quả đăng xuất</returns>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Logout([FromBody] RefreshTokenRequest refreshRequest)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _tokenServices.RevokeTokenAsync(refreshRequest.RefreshToken);
            
            if (!result)
            {
                return BadRequest("Failed to revoke token");
            }

            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Kiểm tra token có hợp lệ không
    /// </summary>
    /// <returns>Trạng thái token</returns>
    [HttpGet("validate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> ValidateToken()
    {
        try
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token not provided");
            }

            var isValid = await _tokenServices.IsTokenValidAsync(token);
            
            if (!isValid)
            {
                return Unauthorized("Invalid or expired token");
            }

            return Ok(new { message = "Token is valid" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
