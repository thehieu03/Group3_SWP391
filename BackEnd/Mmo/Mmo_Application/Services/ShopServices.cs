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

    public async Task<bool> UpdateShopStatusAsync(int shopId, bool isActive)
    {
        try
        {
            // Kiểm tra shop có tồn tại không
            var shop = await GetByIdAsync(shopId);
            if (shop == null)
            {
                return false;
            }

            // Cập nhật trạng thái isActive
            shop.IsActive = isActive;
            shop.UpdatedAt = DateTime.Now;

            // Lưu thay đổi
            await _unitOfWork.SaveChangeAsync();

            // Log thay đổi trạng thái
            var action = isActive ? "UNBANNED" : "BANNED";
            Console.WriteLine($"[AUDIT] Shop {shopId} ({shop.Name}) {action} at {DateTime.Now:yyyy-MM-dd HH:mm:ss}");

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Failed to update shop status: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> BanShopAsync(int shopId)
    {
        return await UpdateShopStatusAsync(shopId, false);
    }

    public async Task<bool> UnbanShopAsync(int shopId)
    {
        return await UpdateShopStatusAsync(shopId, true);
    }
}