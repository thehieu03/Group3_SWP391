using BCrypt.Net;
using Mmo_Domain.Models;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;

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

    public async Task<bool> UpdateProfileAsync(int accountId, ProfileUpdateRequest request)
    {
        var account = await GetByIdAsync(accountId);
        if (account == null)
        {
            return false;
        }

        if (!string.IsNullOrEmpty(request.Username) && request.Username != account.Username)
        {
            var existingAccount = await GetByUsernameAsync(request.Username);
            if (existingAccount != null)
            {
                return false;
            }
        }

        if (!string.IsNullOrEmpty(request.Email) && request.Email != account.Email)
        {
            var existingAccount = await GetByEmailAsync(request.Email);
            if (existingAccount != null)
            {
                return false;
            }
        }

        if (!string.IsNullOrEmpty(request.Username))
        {
            account.Username = request.Username;
        }

        if (!string.IsNullOrEmpty(request.Email))
        {
            account.Email = request.Email;
        }

        if (!string.IsNullOrEmpty(request.Phone))
        {
            account.Phone = request.Phone;
        }

        account.UpdatedAt = DateTime.Now;

        return await UpdateAsync(account);
    }

    public async Task<bool> UpdateAccountAsync(int accountId, UserResponse request)
    {
        var account = await GetByIdAsync(accountId);
        if (account == null)
        {
            return false;
        }

        if (!string.IsNullOrEmpty(request.Username) && request.Username != account.Username)
        {
            var existingAccount = await GetByUsernameAsync(request.Username);
            if (existingAccount != null)
            {
                return false;
            }
        }

        if (!string.IsNullOrEmpty(request.Email) && request.Email != account.Email)
        {
            var existingAccount = await GetByEmailAsync(request.Email);
            if (existingAccount != null)
            {
                return false;
            }
        }

        if (!string.IsNullOrEmpty(request.Username))
        {
            account.Username = request.Username;
        }

        if (!string.IsNullOrEmpty(request.Email))
        {
            account.Email = request.Email;
        }

        if (!string.IsNullOrEmpty(request.Phone))
        {
            account.Phone = request.Phone;
        }

        if (request.Balance.HasValue)
        {
            account.Balance = request.Balance.Value;
        }

        if (request.IsActive.HasValue)
        {
            account.IsActive = request.IsActive.Value;
        }

        account.UpdatedAt = DateTime.Now;

        return await UpdateAsync(account);
    }

    public async Task<bool> DeleteAccountAsync(int accountId, int currentUserId)
    {
        if (accountId == currentUserId)
        {
            return false;
        }

        var account = await GetByIdAsync(accountId);
        if (account == null)
        {
            return false;
        }

        return await DeleteAsync(account);
    }
}