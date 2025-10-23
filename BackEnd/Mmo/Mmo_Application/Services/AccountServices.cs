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

    public async Task<Account?> RegisterAsync(RegisterRequest registerRequest)
    {
        try
        {
            Console.WriteLine($"[REGISTER_SERVICE] Starting registration for: {registerRequest.Username}");

            // Kiểm tra username đã tồn tại chưa
            var existingUsername = await GetByUsernameAsync(registerRequest.Username);
            if (existingUsername != null)
            {
                Console.WriteLine($"[REGISTER_SERVICE] Username already exists: {registerRequest.Username}");
                return null;
            }

            // Kiểm tra email đã tồn tại chưa
            var existingEmail = await GetByEmailAsync(registerRequest.Email);
            if (existingEmail != null)
            {
                Console.WriteLine($"[REGISTER_SERVICE] Email already exists: {registerRequest.Email}");
                return null;
            }

            // Hash password với BCrypt
            Console.WriteLine("[REGISTER_SERVICE] Hashing password...");
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password);

            // Tạo account mới
            var newAccount = new Account
            {
                Username = registerRequest.Username,
                Email = registerRequest.Email,
                Password = hashedPassword,
                Phone = null,
                Balance = 0,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            Console.WriteLine("[REGISTER_SERVICE] Adding account to database...");
            // Lưu account vào database và lấy ID
            await AddAsync(newAccount);
            
            Console.WriteLine("[REGISTER_SERVICE] Saving account changes...");
            await _unitOfWork.SaveChangeAsync();
            Console.WriteLine($"[REGISTER_SERVICE] Account saved successfully. ID: {newAccount.Id}");

            // Gán role CUSTOMER mặc định (người dùng thường)
            Console.WriteLine("[REGISTER_SERVICE] Looking for CUSTOMER role...");
            var customerRoleQuery = await _unitOfWork.GenericRepository<Role>()
                .GetQuery(r => r.RoleName == "CUSTOMER");
            var customerRole = customerRoleQuery.FirstOrDefault();

            if (customerRole == null)
            {
                Console.WriteLine("[REGISTER_SERVICE] ❌ ERROR: CUSTOMER role not found in database!");
                throw new Exception("CUSTOMER role does not exist in the database. Please seed roles: CUSTOMER, ADMIN, SELLER");
            }

            Console.WriteLine($"[REGISTER_SERVICE] CUSTOMER role found. ID: {customerRole.Id}");

            var accountRole = new Accountrole
            {
                AccountId = newAccount.Id,
                RoleId = customerRole.Id
            };

            Console.WriteLine($"[REGISTER_SERVICE] Adding AccountRole (AccountId: {newAccount.Id}, RoleId: {customerRole.Id})...");
            await _unitOfWork.GenericRepository<Accountrole>().AddAsync(accountRole);
            
            Console.WriteLine("[REGISTER_SERVICE] Saving AccountRole changes...");
            await _unitOfWork.SaveChangeAsync();
            Console.WriteLine("[REGISTER_SERVICE] ✅ Registration completed successfully!");

            return newAccount;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[REGISTER_SERVICE] ❌ EXCEPTION: {ex.Message}");
            Console.WriteLine($"[REGISTER_SERVICE] ❌ EXCEPTION TYPE: {ex.GetType().FullName}");
            
            // Log tất cả inner exceptions
            var innerEx = ex.InnerException;
            var depth = 1;
            while (innerEx != null)
            {
                Console.WriteLine($"[REGISTER_SERVICE] ❌ INNER EXCEPTION #{depth}: {innerEx.Message}");
                Console.WriteLine($"[REGISTER_SERVICE] ❌ INNER EXCEPTION #{depth} TYPE: {innerEx.GetType().FullName}");
                innerEx = innerEx.InnerException;
                depth++;
            }
            
            Console.WriteLine($"[REGISTER_SERVICE] ❌ STACK TRACE: {ex.StackTrace}");
            throw;
        }
    }
}