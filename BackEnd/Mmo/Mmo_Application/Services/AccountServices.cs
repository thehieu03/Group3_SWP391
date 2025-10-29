using BCrypt.Net;
using Mmo_Domain.Models;

namespace Mmo_Application.Services;

public class AccountServices : BaseServices<Account>, IAccountServices
{
<<<<<<< Updated upstream
    public AccountServices(IUnitOfWork unitOfWork) : base(unitOfWork)
=======
    private readonly IRoleServices _roleServices;

    public AccountServices(IUnitOfWork unitOfWork, IRoleServices roleServices)
        : base(unitOfWork)
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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

    Task<Account?> IAccountServices.GetByUsernameAsync(string username)
    {
<<<<<<< Updated upstream
        throw new NotImplementedException();
=======
        var accountRolesQuery = await _unitOfWork.GenericRepository<Accountrole>()
            .GetQuery(ar => ar.AccountId == accountId);
        var accountRoles = accountRolesQuery.ToList();

        var roleIds = accountRoles.Select(ar => ar.RoleId).ToList();
        var roles = await _roleServices.GetAllAsync();

        return roles
            .Where(r => roleIds.Contains(r.Id))
            .Select(r => r.RoleName)
            .ToList();
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    }

    Task<Account?> IAccountServices.GetByEmailAsync(string email)
    {
<<<<<<< Updated upstream
        throw new NotImplementedException();
=======
        var account = await GetByIdAsync(accountId);
        if (account == null)
            return false;

        if (!string.IsNullOrEmpty(request.Username) && request.Username != account.Username)
        {
            var existingAccount = await GetByUsernameAsync(request.Username);
            if (existingAccount != null)
                return false;
        }

        if (!string.IsNullOrEmpty(request.Email) && request.Email != account.Email)
        {
            var existingAccount = await GetByEmailAsync(request.Email);
            if (existingAccount != null)
                return false;
        }

        if (!string.IsNullOrEmpty(request.Username))
            account.Username = request.Username;

        if (!string.IsNullOrEmpty(request.Email))
            account.Email = request.Email;

        if (!string.IsNullOrEmpty(request.Phone))
            account.Phone = request.Phone;

        account.UpdatedAt = DateTime.Now;
        return await UpdateAsync(account);
>>>>>>> Stashed changes
    }

    Task<bool> IAccountServices.VerifyPasswordAsync(Account account, string password)
    {
<<<<<<< Updated upstream
        throw new NotImplementedException();
=======
        var account = await GetByIdAsync(accountId);
        if (account == null)
            return false;

        if (!string.IsNullOrEmpty(request.Username) && request.Username != account.Username)
        {
            var existingAccount = await GetByUsernameAsync(request.Username);
            if (existingAccount != null)
                return false;
        }

        if (!string.IsNullOrEmpty(request.Email) && request.Email != account.Email)
        {
            var existingAccount = await GetByEmailAsync(request.Email);
            if (existingAccount != null)
                return false;
        }

        if (!string.IsNullOrEmpty(request.Username))
            account.Username = request.Username;

        if (!string.IsNullOrEmpty(request.Email))
            account.Email = request.Email;

        if (!string.IsNullOrEmpty(request.Phone))
            account.Phone = request.Phone;

        if (request.Balance.HasValue)
            account.Balance = request.Balance.Value;

        if (request.IsActive.HasValue)
            account.IsActive = request.IsActive.Value;

        account.UpdatedAt = DateTime.Now;
        return await UpdateAsync(account);
>>>>>>> Stashed changes
    }

    Task<bool> IAccountServices.ChangePasswordAsync(int accountId, string oldPassword, string newPassword)
    {
<<<<<<< Updated upstream
        throw new NotImplementedException();
    }

    Task<bool> IAccountServices.IsAccountActiveAsync(int accountId)
    {
        throw new NotImplementedException();
=======
        if (accountId == currentUserId)
            return false;

        var account = await GetByIdAsync(accountId);
        if (account == null)
            return false;

        return await DeleteAsync(account);
>>>>>>> Stashed changes
    }

    public async Task<bool> ChangePasswordAsync(int accountId, string oldPassword, string newPassword)
    {
        var account = await GetByIdAsync(accountId);
        if (account == null)
            return false;

        bool oldPasswordValid = BCrypt.Net.BCrypt.Verify(oldPassword, account.Password);
        if (!oldPasswordValid)
            return false;

        account.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
        account.UpdatedAt = DateTime.UtcNow;

        var updated = await UpdateAsync(account);

        return updated;
    }

}
