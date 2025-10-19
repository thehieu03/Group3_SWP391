using BCrypt.Net;
using Mmo_Domain.Models;

namespace Mmo_Application.Services;

public class AccountServices:BaseServices<Account>,IAccountServices
{
    public AccountServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }

    public async Task<Account?> GetByUsernameAsync(string username)
    {
        var accounts = await GetAllAsync();
        return accounts.FirstOrDefault(a => a.Username == username);
    }

    public async Task<Account?> GetByEmailAsync(string email)
    {
        var accounts = await GetAllAsync();
        return accounts.FirstOrDefault(a => a.Email == email);
    }

    public async Task<bool> VerifyPasswordAsync(Account account, string password)
    {
        return BCrypt.Net.BCrypt.Verify(password, account.Password);
    }

    public async Task<bool> IsAccountActiveAsync(int accountId)
    {
        var account = await GetByIdAsync(accountId);
        return account?.IsActive == true;
    }
}