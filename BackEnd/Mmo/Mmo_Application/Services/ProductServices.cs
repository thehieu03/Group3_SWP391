namespace Mmo_Application.Services;

public class ProductServices   :BaseServices<Product>, IProductServices
{
    public ProductServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }

    public async Task<IEnumerable<Product>> GetAllWithRelatedAsync()
    {
        return await _unitOfWork.GenericRepository<Product>().GetAllWithRelatedAsync();
    }
}