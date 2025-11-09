namespace Mmo_Api.Api;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAccountServices _accountServices;
    private readonly ITokenServices _tokenServices;
    private readonly IMapper _mapper;
    private readonly IRoleServices _roleServices;

    public AuthController(IAccountServices accountServices, ITokenServices tokenServices, IMapper mapper, IRoleServices roleServices)
    {
        _accountServices = accountServices;
        _tokenServices = tokenServices;
        _mapper = mapper;
        _roleServices = roleServices;
    }

    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest registerRequest)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Kiểm tra username đã tồn tại chưa
            var existingByUsername = await _accountServices.GetByUsernameAsync(registerRequest.Username);
            if (existingByUsername != null)
                return Conflict(new { message = "Tên đăng nhập đã tồn tại" });

            // Kiểm tra email đã tồn tại chưa
            var existingByEmail = await _accountServices.GetByEmailAsync(registerRequest.Email);
            if (existingByEmail != null)
                return Conflict(new { message = "Email đã tồn tại" });

            // Hash password
            var hashedPassword = await _accountServices.HashPasswordAsync(registerRequest.Password);

            // Tạo account mới
            var account = _mapper.Map<Account>(registerRequest);
            account.Password = hashedPassword;
            account.IsActive = true;
            account.CreatedAt = DateTime.UtcNow;
            account.UpdatedAt = DateTime.UtcNow;

            // Lưu account
            var accountId = await _accountServices.AddAsync(account);
            if (accountId <= 0 || account.Id <= 0)
                return StatusCode(500, new { message = "Không thể tạo tài khoản" });

            // Gán role CUSTOMER
            try
            {
                var roles = await _roleServices.GetAllAsync();
                var customerRoleId = roles.FirstOrDefault(r => r.RoleName == "CUSTOMER")?.Id ?? 0;
                if (customerRoleId > 0 && account.Id > 0)
                {
                    await _accountServices.UpdateAccountRolesAsync(account.Id, new List<int> { customerRoleId });
                }
            }
            catch (Exception ex)
            {
                // Log warning nhưng không block registration
                Console.WriteLine($"[WARNING] Failed to assign CUSTOMER role: {ex.Message}");
            }

            // Generate tokens và trả về response
            var authResponse = await _tokenServices.GenerateTokensAsync(account);

            return Ok(authResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
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

            // Hỗ trợ đăng nhập bằng username hoặc email
            // Thử tìm bằng email trước (vì email thường được dùng nhiều hơn)
            var account = await _accountServices.GetByEmailAsync(loginRequest.Username);
            
            // Nếu không tìm thấy bằng email, thử tìm bằng username
            if (account == null)
            {
                account = await _accountServices.GetByUsernameAsync(loginRequest.Username);
            }

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

    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (ok, error) = await _accountServices.ForgotPasswordAsync(request.Email);

            if (!ok)
            {
                if (error == "Email không hợp lệ hoặc không tồn tại")
                    return BadRequest(new { message = error });
                
                return StatusCode(500, new { message = error ?? "Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau." });
            }

            return Ok(new { message = "Mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau." });
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
                ImageUrl = account.ImageUrl,
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
