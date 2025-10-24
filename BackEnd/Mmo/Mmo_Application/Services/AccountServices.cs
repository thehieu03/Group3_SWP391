using BCrypt.Net;
using Mmo_Domain.Models;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;

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
        // Kiểm tra nếu mảng role rỗng thì không thực hiện gì
        if (roleIds == null || !roleIds.Any()) return true;

        // Kiểm tra account có tồn tại không
        var account = await GetByIdAsync(userId);
        if (account == null) return false;

        // Lấy các role hiện tại của user bằng Dapper
        var currentAccountRoles = await _dapperService.GetAccountRolesAsync(userId);
        var currentRoleIds = currentAccountRoles.Select(ar => ar.RoleId).ToList();

        // Tìm các role cần thêm (có trong roleIds nhưng chưa có trong currentRoleIds)
        var rolesToAdd = roleIds.Where(roleId => !currentRoleIds.Contains(roleId)).ToList();

        // Thêm các role mới bằng Dapper
        if (rolesToAdd.Any()) return await _dapperService.InsertAccountRolesAsync(userId, rolesToAdd);

        return true;
    }

    public async Task<bool> UpdateAccountRolesAdvancedAsync(int userId, List<int> roleIds, bool replaceAll = false)
    {
        // Kiểm tra account có tồn tại không
        var account = await GetByIdAsync(userId);
        if (account == null) return false;

        // Nếu list null thì không làm gì
        if (roleIds == null) return true;

        // Lấy roles hiện tại
        var currentAccountRoles = await _dapperService.GetAccountRolesAsync(userId);
        var currentRoleIds = currentAccountRoles.Select(ar => ar.RoleId ?? 0).ToList();

        // Debug logging
        Console.WriteLine($"[DEBUG] User {userId} - Current roles: [{string.Join(", ", currentRoleIds)}]");
        Console.WriteLine($"[DEBUG] User {userId} - New roles: [{string.Join(", ", roleIds)}]");

        // Tìm roles cần thêm (có trong roleIds nhưng chưa có trong currentRoleIds)
        var rolesToAdd = roleIds.Where(roleId => !currentRoleIds.Contains(roleId)).ToList();

        // Tìm roles cần xóa (có trong currentRoleIds nhưng không có trong roleIds)
        var rolesToRemove = currentRoleIds.Where(roleId => !roleIds.Contains(roleId)).ToList();

        Console.WriteLine($"[DEBUG] User {userId} - Roles to add: [{string.Join(", ", rolesToAdd)}]");
        Console.WriteLine($"[DEBUG] User {userId} - Roles to remove: [{string.Join(", ", rolesToRemove)}]");

        // Kiểm tra xem có role "seller" trong danh sách cần xóa không
        var hasSellerRoleToRemove = rolesToRemove.Contains(2); // Giả sử roleId = 2 là seller

        // Xóa roles không cần thiết TRƯỚC
        if (rolesToRemove.Any())
        {
            var deleteResult = await _dapperService.DeleteAccountRolesAsync(userId, rolesToRemove);
            if (!deleteResult) return false;
        }

        // Thêm roles mới SAU
        if (rolesToAdd.Any())
        {
            var insertResult = await _dapperService.InsertAccountRolesAsync(userId, rolesToAdd);
            if (!insertResult) return false;
        }

        // Nếu xóa role "seller" thì deactivate shops
        if (hasSellerRoleToRemove) await _dapperService.DeactivateUserShopsAsync(userId);

        return true;
    }

    public async Task<bool> RemoveAccountRolesAsync(int userId, List<int> roleIds)
    {
        // Kiểm tra account có tồn tại không
        var account = await GetByIdAsync(userId);
        if (account == null) return false;

        if (roleIds == null || !roleIds.Any()) return true;

        // Lấy roles hiện tại để kiểm tra xem có role "seller" không
        var currentAccountRoles = await _dapperService.GetAccountRolesAsync(userId);
        var currentRoleIds = currentAccountRoles.Select(ar => ar.RoleId).ToList();

        // Kiểm tra xem có role "seller" (giả sử roleId = 2) trong danh sách roles cần xóa không
        var hasSellerRole = roleIds.Contains(2); // Giả sử roleId = 2 là seller role

        // Xóa roles
        var result = await _dapperService.DeleteAccountRolesAsync(userId, roleIds);

        // Nếu xóa role "seller" thì deactivate shops của user
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
            // Kiểm tra account có tồn tại không
            var account = await GetByIdAsync(userId);
            if (account == null) return false;

            // Cập nhật trạng thái isActive
            account.IsActive = isActive;

            // Lưu thay đổi
            await _unitOfWork.SaveChangeAsync();

            // Log thay đổi trạng thái
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
}