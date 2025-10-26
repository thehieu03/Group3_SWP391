using Mmo_Application.Services.Interface;
using Mmo_Domain.IUnit;
using Mmo_Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Mmo_Application.Services;

public class ShopServices : BaseServices<Shop>, IShopServices
{
    public ShopServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }

    public async Task<IEnumerable<Shop>> GetAllWithDetailsAsync()
    {
        return await _unitOfWork.GenericRepository<Shop>()
            .Get(includeProperties: "Account,Products,Replies")
            .ToListAsync();
    }

    public async Task<bool> UpdateShopStatusAsync(int shopId, string status)
    {
        try
        {
            if (!IsValidStatus(status))
            {
                return false;
            }

            var shop = await GetByIdAsync(shopId);
            if (shop == null)
            {
                return false;
            }

            shop.Status = status;
            shop.UpdatedAt = DateTime.Now;

            var products = await _unitOfWork.GenericRepository<Product>()
                .Get(p => p.ShopId == shopId)
                .ToListAsync();

            bool shouldActivateProducts = status == "APPROVED";
            
            foreach (var product in products)
            {
                product.IsActive = shouldActivateProducts;
                product.UpdatedAt = DateTime.Now;
            }

            await _unitOfWork.SaveChangeAsync();

            Console.WriteLine($"[AUDIT] Shop {shopId} ({shop.Name}) status changed to {status} at {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            Console.WriteLine($"[AUDIT] {products.Count} products of shop {shopId} isActive set to {shouldActivateProducts}");

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Failed to update shop status: {ex.Message}");
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
}
