namespace Mmo_Application.Services.Interface;

public interface IProductServices :IBaseServices<Product>
{
    Task<IEnumerable<Product>> GetAllWithRelatedAsync();
    Task<IEnumerable<Product>> GetProductsByShopIdAsync(int shopId);
    Task<Product?> GetProductByIdWithRelatedAsync(int productId);
    Task<bool> UpdateProductStatusAsync(int productId, bool isActive);
}
