using BCrypt.Net;
using Mmo_Domain.Models;

namespace Mmo_Application.Services;

public class AccountServices:BaseServices<Account>,IAccountServices
{
    private readonly IRoleServices _roleServices;

    public AccountServices(IUnitOfWork unitOfWork, IRoleServices roleServices) : base(unitOfWork)
    {
        _roleServices = roleServices;
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

    public Task<bool> VerifyPasswordAsync(Account account, string password)
    {
        return Task.FromResult(BCrypt.Net.BCrypt.Verify(password, account.Password));
    }

    public async Task<bool> IsAccountActiveAsync(int accountId)
    {
        var account = await GetByIdAsync(accountId);
        return account?.IsActive == true;
    }

    public async Task<List<string>> GetUserRolesAsync(int accountId)
    {
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