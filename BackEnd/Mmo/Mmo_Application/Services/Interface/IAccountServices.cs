using Mmo_Domain.Models;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services.Interface;

public interface IAccountServices:IBaseServices<Account>
{
    Task<Account?> GetByUsernameAsync(string username);
    Task<Account?> GetByEmailAsync(string email);
    Task<bool> VerifyPasswordAsync(Account account, string password);
    Task<bool> IsAccountActiveAsync(int accountId);
    Task<List<string>> GetUserRolesAsync(int accountId);
    Task<bool> UpdateProfileAsync(int accountId, ProfileUpdateRequest request);
    Task<bool> UpdateAccountAsync(int accountId, UserResponse request);
    Task<bool> DeleteAccountAsync(int accountId, int currentUserId);
}