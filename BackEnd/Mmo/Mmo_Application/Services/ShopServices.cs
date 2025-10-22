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
            .Get(includeProperties: "Account,Products")
            .ToListAsync();
    }
}