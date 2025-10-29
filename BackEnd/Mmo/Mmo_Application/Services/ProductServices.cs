using Microsoft.EntityFrameworkCore;
using Mmo_Application.Services.Interface;
using Mmo_Domain.IUnit;
using Mmo_Domain.Models;

namespace Mmo_Application.Services;

public class ProductServices : BaseServices<Product>, IProductServices
{
    public ProductServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Product>> GetAllWithRelatedAsync()
    {
        return await _unitOfWork.GenericRepository<Product>()
            .Get(includeProperties: "Shop,Category,Subcategory,Productvariants,Feedbacks")
            .ToListAsync();
    }
}