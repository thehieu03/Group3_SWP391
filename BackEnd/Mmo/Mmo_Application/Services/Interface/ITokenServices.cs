namespace Mmo_Application.Services.Interface;

public interface ITokenServices: IBaseServices<Token>
{
    Task<AuthResponse> GenerateTokensAsync(Account account);
    Task<RefreshTokenResponse?> RefreshTokenAsync(string refreshToken);
    Task<bool> RevokeTokenAsync(string refreshToken);
    Task<bool> IsTokenValidAsync(string token);
}
