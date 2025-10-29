namespace Mmo_Application.Services;

public class AccountServices : BaseServices<Account>, IAccountServices
{
    private readonly IRoleServices _roleServices;
    private readonly IDapperService _dapperService;

    public AccountServices(IUnitOfWork unitOfWork, IRoleServices roleServices, IDapperService dapperService) :
        base(unitOfWork)
    {
        _roleServices = roleServices;
        _dapperService = dapperService;
        _unitOfWork = unitOfWork;
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

    public Task<string> HashPasswordAsync(string password)
    {
        return Task.FromResult(BCrypt.Net.BCrypt.HashPassword(password));
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
        if (account == null) return false;

        if (!string.IsNullOrEmpty(request.Username) && request.Username != account.Username)
        {
            var existingAccount = await GetByUsernameAsync(request.Username);
            if (existingAccount != null) return false;
        }

        if (!string.IsNullOrEmpty(request.Email) && request.Email != account.Email)
        {
            var existingAccount = await GetByEmailAsync(request.Email);
            if (existingAccount != null) return false;
        }

        if (!string.IsNullOrEmpty(request.Username)) account.Username = request.Username;

        if (!string.IsNullOrEmpty(request.Email)) account.Email = request.Email;

        if (!string.IsNullOrEmpty(request.Phone)) account.Phone = request.Phone;

        account.UpdatedAt = DateTime.Now;

        return await UpdateAsync(account);
    }

    public async Task<bool> UpdateAccountAsync(int accountId, UserResponse request)
    {
        var account = await GetByIdAsync(accountId);
        if (account == null) return false;

        if (!string.IsNullOrEmpty(request.Username) && request.Username != account.Username)
        {
            var existingAccount = await GetByUsernameAsync(request.Username);
            if (existingAccount != null) return false;
        }

        if (!string.IsNullOrEmpty(request.Email) && request.Email != account.Email)
        {
            var existingAccount = await GetByEmailAsync(request.Email);
            if (existingAccount != null) return false;
        }

        if (!string.IsNullOrEmpty(request.Username)) account.Username = request.Username;

        if (!string.IsNullOrEmpty(request.Email)) account.Email = request.Email;

        if (!string.IsNullOrEmpty(request.Phone)) account.Phone = request.Phone;

        if (request.Balance.HasValue) account.Balance = request.Balance.Value;

        if (request.IsActive.HasValue) account.IsActive = request.IsActive.Value;

        account.UpdatedAt = DateTime.Now;

        return await UpdateAsync(account);
    }

    public async Task<bool> DeleteAccountAsync(int accountId, int currentUserId)
    {
        if (accountId == currentUserId) return false;

        var account = await GetByIdAsync(accountId);
        if (account == null) return false;

        return await DeleteAsync(account);
    }

    public async Task<bool> UpdateAccountRolesAsync(int userId, List<int> roleIds)
    {
        if (roleIds == null || !roleIds.Any()) return true;


        var account = await GetByIdAsync(userId);
        if (account == null) return false;


        var currentAccountRoles = await _dapperService.GetAccountRolesAsync(userId);
        var currentRoleIds = currentAccountRoles.Select(ar => ar.RoleId).ToList();


        var rolesToAdd = roleIds.Where(roleId => !currentRoleIds.Contains(roleId)).ToList();


        if (rolesToAdd.Any()) return await _dapperService.InsertAccountRolesAsync(userId, rolesToAdd);

        return true;
    }

    public async Task<bool> UpdateAccountRolesAdvancedAsync(int userId, List<int> roleIds, bool replaceAll = false)
    {
        var account = await GetByIdAsync(userId);
        if (account == null) return false;


        if (roleIds == null) return true;


        var currentAccountRoles = await _dapperService.GetAccountRolesAsync(userId);
        var currentRoleIds = currentAccountRoles.Select(ar => ar.RoleId ?? 0).ToList();


        Console.WriteLine($"[DEBUG] User {userId} - Current roles: [{string.Join(", ", currentRoleIds)}]");
        Console.WriteLine($"[DEBUG] User {userId} - New roles: [{string.Join(", ", roleIds)}]");


        var rolesToAdd = roleIds.Where(roleId => !currentRoleIds.Contains(roleId)).ToList();


        var rolesToRemove = currentRoleIds.Where(roleId => !roleIds.Contains(roleId)).ToList();

        Console.WriteLine($"[DEBUG] User {userId} - Roles to add: [{string.Join(", ", rolesToAdd)}]");
        Console.WriteLine($"[DEBUG] User {userId} - Roles to remove: [{string.Join(", ", rolesToRemove)}]");


        var hasSellerRoleToRemove = rolesToRemove.Contains(2); // Giả sử roleId = 2 là seller


        if (rolesToRemove.Any())
        {
            var deleteResult = await _dapperService.DeleteAccountRolesAsync(userId, rolesToRemove);
            if (!deleteResult) return false;
        }


        if (rolesToAdd.Any())
        {
            var insertResult = await _dapperService.InsertAccountRolesAsync(userId, rolesToAdd);
            if (!insertResult) return false;
        }


        if (hasSellerRoleToRemove) await _dapperService.DeactivateUserShopsAsync(userId);

        return true;
    }

    public async Task<bool> RemoveAccountRolesAsync(int userId, List<int> roleIds)
    {
        var account = await GetByIdAsync(userId);
        if (account == null) return false;

        if (roleIds == null || !roleIds.Any()) return true;


        var currentAccountRoles = await _dapperService.GetAccountRolesAsync(userId);
        var currentRoleIds = currentAccountRoles.Select(ar => ar.RoleId).ToList();


        var hasSellerRole = roleIds.Contains(2);


        var result = await _dapperService.DeleteAccountRolesAsync(userId, roleIds);


        if (result && hasSellerRole) await _dapperService.DeactivateUserShopsAsync(userId);

        return result;
    }

    public async Task<List<int>> GetUserRoleIdsAsync(int accountId)
    {
        var accountRolesQuery = await _unitOfWork.GenericRepository<Accountrole>()
            .GetQuery(ar => ar.AccountId == accountId);
        var accountRoles = accountRolesQuery.ToList();

        return accountRoles.Select(ar => ar.RoleId ?? 0).ToList();
    }

    public async Task<bool> UpdateUserStatusAsync(int userId, bool isActive)
    {
        try
        {
            var account = await GetByIdAsync(userId);
            if (account == null) return false;
            account.IsActive = isActive;
            await _unitOfWork.SaveChangeAsync();
            var action = isActive ? "UNBANNED" : "BANNED";
            Console.WriteLine($"[AUDIT] User {userId} {action} at {DateTime.Now:yyyy-MM-dd HH:mm:ss}");

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Failed to update user status: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> BanUserAsync(int userId)
    {
        return await UpdateUserStatusAsync(userId, false);
    }

    public async Task<bool> UnbanUserAsync(int userId)
    {
        return await UpdateUserStatusAsync(userId, true);
    }

    public async Task<UserStatistics> GetUserStatisticsAsync()
    {
        var allUsers = await GetAllAsync();
        var users = allUsers.ToList();

        var totalUsers = users.Count;
        var activeUsers = users.Count(u => u.IsActive == true);
        var inactiveUsers = users.Count(u => u.IsActive == false);

        var customers = 0;
        var sellers = 0;

        foreach (var user in users)
        {
            var roles = await GetUserRolesAsync(user.Id);
            if (roles.Contains("SELLER"))
                sellers++;
            if (roles.Contains("CUSTOMER"))
                customers++;
        }

        return new UserStatistics
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            InactiveUsers = inactiveUsers,
            Customers = customers,
            Sellers = sellers
        };
    }

    public async Task<Account> CheckAccountByGoogleId(string googleId)
    {
        var accounts = await GetAllAsync();
        var accountResponse = accounts.FirstOrDefault(a => a.GoogleId == googleId);
        return accountResponse != null ? accountResponse : null;
    }
}