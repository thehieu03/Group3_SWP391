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

    public async Task<IEnumerable<Product>> GetProductsByShopIdAsync(int shopId)
    {
        return await _unitOfWork.GenericRepository<Product>()
            .Get(filter: p => p.ShopId == shopId, includeProperties: "Shop,Category,Subcategory,Productvariants,Feedbacks")
            .ToListAsync();
    }

    public async Task<Product?> GetProductByIdWithRelatedAsync(int productId)
    {
        return await _unitOfWork.GenericRepository<Product>()
            .Get(filter: p => p.Id == productId, includeProperties: "Shop,Category,Subcategory,Productvariants,Feedbacks")
            .FirstOrDefaultAsync();
    }

    public async Task<bool> UpdateProductStatusAsync(int productId, bool isActive)
    {
        var product = await _unitOfWork.GenericRepository<Product>().GetByIdAsync(productId);
        if (product == null) return false;

        product.IsActive = isActive;
        product.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.GenericRepository<Product>().Update(product);
        return await _unitOfWork.SaveChangeAsync() > 0;
    }
}