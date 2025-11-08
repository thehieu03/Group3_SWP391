using Microsoft.Extensions.Logging;

namespace Mmo_Application.Services;

public class ShopServices : BaseServices<Shop>, IShopServices
{
    private readonly ILogger<ShopServices> _logger;

    public ShopServices(IUnitOfWork unitOfWork, ILogger<ShopServices> logger) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IEnumerable<Shop>> GetAllWithDetailsAsync()
    {
        return await _unitOfWork.GenericRepository<Shop>()
            .Get(includeProperties: "Account,Products,Replies")
            .ToListAsync();
    }

    public async Task<Shop?> GetByAccountIdAsync(int accountId)
    {
        var query = _unitOfWork.GenericRepository<Shop>().Get(
            filter: s => s.AccountId == accountId,
            includeProperties: "Account,Products,Replies"
        );
        return await Task.FromResult(query.FirstOrDefault());
    }

    public async Task<bool> UpdateShopStatusAsync(int shopId, string status)
    {
        try
        {
            if (!IsValidStatus(status)) return false;

            var shop = await GetByIdAsync(shopId);
            if (shop == null) return false;

            shop.Status = status;
            shop.UpdatedAt = DateTime.Now;

            var products = await _unitOfWork.GenericRepository<Product>()
                .Get(p => p.ShopId == shopId)
                .ToListAsync();

            var shouldActivateProducts = status == "APPROVED";

            foreach (var product in products)
            {
                product.IsActive = shouldActivateProducts;
                product.UpdatedAt = DateTime.Now;
            }

            await _unitOfWork.SaveChangeAsync();

            _logger.LogInformation("Shop {ShopId} ({ShopName}) status changed to {Status} at {Timestamp}", 
                shopId, shop.Name, status, DateTime.Now);
            _logger.LogInformation("{ProductCount} products of shop {ShopId} isActive set to {IsActive}", 
                products.Count, shopId, shouldActivateProducts);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update shop status for shop {ShopId}", shopId);
            return false;
        }
    }

    public async Task<bool> ApproveShopAsync(int shopId)
    {
        return await UpdateShopStatusAsync(shopId, "APPROVED");
    }

    public async Task<bool> BanShopAsync(int shopId)
    {
        return await UpdateShopStatusAsync(shopId, "BANNED");
    }

    public async Task<bool> PendingShopAsync(int shopId)
    {
        return await UpdateShopStatusAsync(shopId, "PENDING");
    }

    private bool IsValidStatus(string status)
    {
        return status == "PENDING" || status == "APPROVED" || status == "BANNED";
    }

    public async Task<ShopStatistics> GetShopStatisticsAsync()
    {
        var allShops = await GetAllAsync();
        var shops = allShops.ToList();

        var totalShops = shops.Count;
        var pendingShops = shops.Count(s => s.Status == "PENDING");
        var approvedShops = shops.Count(s => s.Status == "APPROVED");
        var bannedShops = shops.Count(s => s.Status == "BANNED");

        return new ShopStatistics
        {
            TotalShops = totalShops,
            PendingShops = pendingShops,
            ApprovedShops = approvedShops,
            BannedShops = bannedShops
        };
    }
}