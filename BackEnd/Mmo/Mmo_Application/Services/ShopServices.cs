using Mmo_Domain.Models;
using Mmo_Domain.IUnit;
using Microsoft.EntityFrameworkCore;

namespace Mmo_Application.Services;

public class ShopServices : BaseServices<Shop>, IShopServices
{
    public ShopServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }

    public async Task<Shop?> GetByAccountIdAsync(int accountId)
    {
        var shop = await _unitOfWork.GenericRepository<Shop>()
            .GetQuery()
            .Include(s => s.Account)
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.AccountId == accountId);
        
        return shop;
    }
}