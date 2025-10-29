

namespace Mmo_Application.Services;

public class ProductServices   :BaseServices<Product>, IProductServices
{
    public ProductServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }
<<<<<<< Updated upstream
<<<<<<< Updated upstream

    public async Task<IEnumerable<Product>> GetAllWithRelatedAsync()
    {
        return await _unitOfWork.GenericRepository<Product>().GetAllWithRelatedAsync();
=======
=======
>>>>>>> Stashed changes
    public async Task<IEnumerable<Product>> GetBySubcategoryIdAsync(int subcategoryId)
    {
        var products = await _unitOfWork.GenericRepository<Product>().GetAllAsync();
        return products
            .Where(p => p.SubcategoryId == (uint)subcategoryId)
            .OrderByDescending(p => p.Id)
            .ToList();
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    }
}