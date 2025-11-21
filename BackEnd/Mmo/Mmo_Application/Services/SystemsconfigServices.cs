using Mmo_Domain.ModelRequest;
using Mmo_Domain.Models;

namespace Mmo_Application.Services;

public class SystemsconfigServices : BaseServices<Systemsconfig>, ISystemsconfigServices
{
    private readonly IDapperService _dapperService;

    public SystemsconfigServices(IUnitOfWork unitOfWork, IDapperService dapperService) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
        _dapperService = dapperService;
    }

    public async Task<Systemsconfig?> GetSystemConfigAsync()
    {
        var sql = "SELECT email, fee, googleAppPassword FROM systemsconfig LIMIT 1";
        return await _dapperService.QueryFirstOrDefaultAsync<Systemsconfig>(sql);
    }

    public async Task<bool> UpdateSystemConfigAsync(SystemConfigRequest request)
    {
        // Get current config to preserve password if not provided
        var currentConfig = await GetSystemConfigAsync();
        var passwordToUpdate = request.GoogleAppPassword;
        
        // If password is masked or empty, keep the current password
        if (string.IsNullOrWhiteSpace(passwordToUpdate) || passwordToUpdate == "********")
        {
            passwordToUpdate = currentConfig?.GoogleAppPassword ?? request.GoogleAppPassword;
        }

        var sql = @"
            UPDATE systemsconfig 
            SET email = @Email, 
                fee = @Fee, 
                googleAppPassword = @GoogleAppPassword
            LIMIT 1";

        var parameters = new
        {
            Email = request.Email,
            Fee = request.Fee,
            GoogleAppPassword = passwordToUpdate
        };

        var affectedRows = await _dapperService.ExecuteAsync(sql, parameters);
        return affectedRows > 0;
    }
}