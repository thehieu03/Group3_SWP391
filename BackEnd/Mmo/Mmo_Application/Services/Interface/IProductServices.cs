namespace Mmo_Application.Services.Interface;

public interface IProductServices :IBaseServices<Product>
{
<<<<<<< Updated upstream
    Task<IEnumerable<Product>> GetAllWithRelatedAsync();
=======
    Task<IEnumerable<Product>> GetBySubcategoryIdAsync(int subcategoryId);

>>>>>>> Stashed changes
}