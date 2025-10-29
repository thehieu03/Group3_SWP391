namespace Mmo_Application.Services;

public class ProductVariantServices : BaseServices<Productvariant>, IProductVariantServices
{
    public ProductVariantServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
}