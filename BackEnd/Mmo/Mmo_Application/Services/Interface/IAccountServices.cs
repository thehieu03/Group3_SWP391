using Mmo_Domain.Models;

namespace Mmo_Application.Services.Interface;

public interface IAccountServices:IBaseServices<Account>
{
    Task<Account?> GetByUsernameAsync(string username);
    Task<Account?> GetByEmailAsync(string email);
    Task<bool> VerifyPasswordAsync(Account account, string password);
    Task<bool> ChangePasswordAsync(int accountId, string oldPassword, string newPassword);
    Task<bool> IsAccountActiveAsync(int accountId);
<<<<<<< Updated upstream
=======
    Task<List<string>> GetUserRolesAsync(int accountId);
    Task<bool> UpdateProfileAsync(int accountId, ProfileUpdateRequest request);
    Task<bool> UpdateAccountAsync(int accountId, UserResponse request);
    Task<bool> DeleteAccountAsync(int accountId, int currentUserId);
    Task<bool> ChangePasswordAsync(int accountId, string oldPassword, string newPassword);

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
}