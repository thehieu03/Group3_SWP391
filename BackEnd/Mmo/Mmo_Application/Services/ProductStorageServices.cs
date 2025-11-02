namespace Mmo_Application.Services;

public class ProductStorageServices : BaseServices<Productstorage>, IProductStorageServices
{
    public ProductStorageServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
}