using Mmo_Domain.ModelRequest;

namespace Mmo_Application.Services;

public class SystemsconfigServices: BaseServices<Systemsconfig>, ISystemsconfigServices
{
    public SystemsconfigServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }

    public async Task<Systemsconfig?> GetSystemConfigAsync()
    {
        // Lấy config đầu tiên trong hệ thống (chỉ có 1 record)
        var configs = await GetAllAsync();
        return configs.FirstOrDefault();
    }

    public async Task<bool> UpdateSystemConfigAsync(UpdateSystemConfigRequest request)
    {
        // Lấy config hiện tại
        var existingConfig = await GetSystemConfigAsync();

        if (existingConfig != null)
        {
            // Update config hiện tại
            existingConfig.Email = request.Email;
            existingConfig.Fee = request.Fee;
            existingConfig.GoogleAppPassword = request.GoogleAppPassword;

            return await UpdateAsync(existingConfig);
        }
        else
        {
            // Tạo config mới nếu chưa có
            var newConfig = new Systemsconfig
            {
                Email = request.Email,
                Fee = request.Fee,
                GoogleAppPassword = request.GoogleAppPassword
            };

            await AddAsync(newConfig);
            return true;
        }
    }
}