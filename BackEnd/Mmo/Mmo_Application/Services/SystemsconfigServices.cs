using Mmo_Domain.ModelRequest;

namespace Mmo_Application.Services;

public class SystemsconfigServices: BaseServices<Systemsconfig>, ISystemsconfigServices
{
    public SystemsconfigServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }

    public async Task<Systemsconfig?> GetSystemConfigAsync()
    {
        var configs = await GetAllAsync();
        return configs.FirstOrDefault();
    }

    public async Task<bool> UpdateSystemConfigAsync(UpdateSystemConfigRequest request)
    {
        try
        {
            Console.WriteLine("[SYSTEMSCONFIG] Starting update...");
            Console.WriteLine($"[SYSTEMSCONFIG] Email: {request.Email}, Fee: {request.Fee}");

            // Lấy config hiện tại
            var existingConfig = await GetSystemConfigAsync();

            if (existingConfig != null)
            {
                Console.WriteLine($"[SYSTEMSCONFIG] Found existing config with ID: {existingConfig.Id}");
                
                // Update config hiện tại
                existingConfig.Email = request.Email;
                existingConfig.Fee = request.Fee;
                existingConfig.GoogleAppPassword = request.GoogleAppPassword;

                Console.WriteLine("[SYSTEMSCONFIG] Updating existing config...");
                var result = await UpdateAsync(existingConfig);
                Console.WriteLine($"[SYSTEMSCONFIG] Update result: {result}");
                return result;
            }
            else
            {
                Console.WriteLine("[SYSTEMSCONFIG] No existing config found. Creating new...");
                
                // Tạo config mới nếu chưa có
                var newConfig = new Systemsconfig
                {
                    Email = request.Email,
                    Fee = request.Fee,
                    GoogleAppPassword = request.GoogleAppPassword
                };

                await AddAsync(newConfig);
                Console.WriteLine("[SYSTEMSCONFIG] New config created successfully");
                return true;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SYSTEMSCONFIG] ❌ ERROR: {ex.Message}");
            Console.WriteLine($"[SYSTEMSCONFIG] ❌ STACK TRACE: {ex.StackTrace}");
            
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[SYSTEMSCONFIG] ❌ INNER EXCEPTION: {ex.InnerException.Message}");
            }
            
            throw;
        }
    }
}