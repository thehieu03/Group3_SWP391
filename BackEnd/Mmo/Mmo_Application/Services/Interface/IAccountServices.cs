namespace Mmo_Application.Services.Interface;

public interface IAccountServices : IBaseServices<Account>
{
    Task<Account?> GetByUsernameAsync(string username);
    Task<Account?> GetByEmailAsync(string email);
    Task<bool> VerifyPasswordAsync(Account account, string password);
    Task<string> HashPasswordAsync(string password);
    Task<bool> IsAccountActiveAsync(int accountId);
    Task<List<string>> GetUserRolesAsync(int accountId);
    Task<bool> UpdateProfileAsync(int accountId, ProfileUpdateRequest request);
    Task<bool> UpdateAccountAsync(int accountId, UserResponse request);
    Task<bool> DeleteAccountAsync(int accountId, int currentUserId);
    Task<bool> UpdateAccountRolesAsync(int userId, List<int> roleIds);
    Task<bool> UpdateAccountRolesAdvancedAsync(int userId, List<int> roleIds, bool replaceAll = false);
    Task<bool> RemoveAccountRolesAsync(int userId, List<int> roleIds);
    Task<List<int>> GetUserRoleIdsAsync(int accountId);
    Task<bool> UpdateUserStatusAsync(int userId, bool isActive);
    Task<bool> BanUserAsync(int userId);
    Task<bool> UnbanUserAsync(int userId);
    Task<UserStatistics> GetUserStatisticsAsync();
    Task<Account> CheckAccountByGoogleId(string googleId);
    Task<(bool ok, string? error)> ChangePasswordAsync(int accountId, string currentPassword, string newPassword);
}