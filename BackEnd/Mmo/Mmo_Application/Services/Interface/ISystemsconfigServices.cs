using Mmo_Domain.ModelRequest;

namespace Mmo_Application.Services.Interface;

public interface ISystemsconfigServices:IBaseServices<Systemsconfig>
{
    Task<Systemsconfig?> GetSystemConfigAsync();
    Task<bool> UpdateSystemConfigAsync(UpdateSystemConfigRequest request);
}