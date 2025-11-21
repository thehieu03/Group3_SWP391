using Mmo_Domain.ModelRequest;

namespace Mmo_Application.Services.Interface;

public interface ISystemsconfigServices:IBaseServices<Systemsconfig>
{
    Task<bool> UpdateSystemConfigAsync(SystemConfigRequest request);
    Task<Systemsconfig?> GetSystemConfigAsync();
}
