namespace Mmo_Application.Services.Interface;

public interface IShopServices : IBaseServices<Shop>
{
    Task<IEnumerable<Shop>> GetAllWithDetailsAsync();
    Task<bool> UpdateShopStatusAsync(int shopId, string status);
    Task<bool> ApproveShopAsync(int shopId);
    Task<bool> BanShopAsync(int shopId);
    Task<bool> PendingShopAsync(int shopId);
    Task<ShopStatistics> GetShopStatisticsAsync();
}
