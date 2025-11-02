namespace Mmo_Application.Services;

public class SubcategoryServices : BaseServices<Subcategory>, ISubcategoryServices
{
    public SubcategoryServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
}