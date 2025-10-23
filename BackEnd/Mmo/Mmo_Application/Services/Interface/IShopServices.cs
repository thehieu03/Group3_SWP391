using Mmo_Domain.Models;

namespace Mmo_Application.Services.Interface;

public interface IShopServices : IBaseServices<Shop>
{
    Task<IEnumerable<Shop>> GetAllWithDetailsAsync();
    Task<bool> UpdateShopStatusAsync(int shopId, bool isActive);
    Task<bool> BanShopAsync(int shopId);
    Task<bool> UnbanShopAsync(int shopId);
}