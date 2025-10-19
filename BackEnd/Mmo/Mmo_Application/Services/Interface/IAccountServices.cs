using Mmo_Domain.Models;

namespace Mmo_Application.Services.Interface;

public interface IAccountServices:IBaseServices<Account>
{
    Task<Account?> GetByUsernameAsync(string username);
    Task<Account?> GetByEmailAsync(string email);
    Task<bool> VerifyPasswordAsync(Account account, string password);
    Task<bool> IsAccountActiveAsync(int accountId);
    Task<List<string>> GetUserRolesAsync(int accountId);
}