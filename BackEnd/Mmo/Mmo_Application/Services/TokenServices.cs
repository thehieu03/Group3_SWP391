using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Mmo_Domain.ModelResponse;
using Mmo_Domain.Models;

namespace Mmo_Application.Services;

public class TokenServices : BaseServices<Token>, ITokenServices
{
    private readonly IConfiguration _configuration;
    private readonly IAccountServices _accountServices;
    private readonly IRoleServices _roleServices;

    public TokenServices(IUnitOfWork unitOfWork, IConfiguration configuration, 
        IAccountServices accountServices, IRoleServices roleServices) : base(unitOfWork)
    {
        _configuration = configuration;
        _accountServices = accountServices;
        _roleServices = roleServices;
    }

    public async Task<AuthResponse> GenerateTokensAsync(Account account)
    {
        // Lấy roles trước khi tạo token
        var roles = await GetUserRolesAsync(account.Id);
        
        var accessToken = GenerateAccessToken(account, roles);
        var refreshToken = GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes());

        // Lưu token vào database
        var token = new Token
        {
            AccountId = account.Id,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow
        };

        await AddAsync(token);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            User = new AccountResponse
            {
                Id = account.Id,
                Username = account.Username,
                Email = account.Email,
                Phone = account.Phone,
                Balance = account.Balance,
                IsActive = account.IsActive,
                CreatedAt = account.CreatedAt,
                Roles = roles
            }
        };
    }

    public async Task<RefreshTokenResponse?> RefreshTokenAsync(string refreshToken)
    {
        // Tìm token trong database
        var tokenQuery = await _unitOfWork.GenericRepository<Token>()
            .GetQuery(t => t.RefreshToken == refreshToken);
        var token = tokenQuery.FirstOrDefault();

        if (token == null || token.ExpiresAt < DateTime.UtcNow)
        {
            return null;
        }

        // Lấy account
        var account = await _accountServices.GetByIdAsync(token.AccountId);
        if (account == null)
        {
            return null;
        }

        // Lấy roles và tạo token mới
        var roles = await GetUserRolesAsync(account.Id);
        var newAccessToken = GenerateAccessToken(account, roles);
        var newRefreshToken = GenerateRefreshToken();
        var newExpiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes());

        // Cập nhật token trong database
        token.AccessToken = newAccessToken;
        token.RefreshToken = newRefreshToken;
        token.ExpiresAt = newExpiresAt;
        await UpdateAsync(token);

        return new RefreshTokenResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = newExpiresAt
        };
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        var tokenQuery = await _unitOfWork.GenericRepository<Token>()
            .GetQuery(t => t.RefreshToken == refreshToken);
        var token = tokenQuery.FirstOrDefault();

        if (token == null)
        {
            return false;
        }

        return await DeleteAsync(token);
    }

    public async Task<bool> IsTokenValidAsync(string token)
    {
        var tokenQuery = await _unitOfWork.GenericRepository<Token>()
            .GetQuery(t => t.AccessToken == token);
        var dbToken = tokenQuery.FirstOrDefault();

        return dbToken != null && dbToken.ExpiresAt > DateTime.UtcNow;
    }

    private string GenerateAccessToken(Account account, List<string> roles)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new(ClaimTypes.Name, account.Username),
            new(ClaimTypes.Email, account.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes()),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private int GetTokenExpirationMinutes()
    {
        return int.Parse(_configuration["Jwt:DurationInMinutes"] ?? "60");
    }

    private async Task<List<string>> GetUserRolesAsync(int accountId)
    {
        // Lấy roles của user từ AccountRole
        var accountRolesQuery = await _unitOfWork.GenericRepository<Accountrole>()
            .GetQuery(ar => ar.AccountId == accountId);
        var accountRoles = accountRolesQuery.ToList();

        var roleIds = accountRoles.Select(ar => ar.RoleId).ToList();
        var roles = await _roleServices.GetAllAsync();
        
        return roles.Where(r => roleIds.Contains(r.Id))
                   .Select(r => r.RoleName)
                   .ToList();
    }
}