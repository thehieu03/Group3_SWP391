namespace Mmo_Application.Services;

public class CategoryServices  :BaseServices<Category>,ICategoryServices
{
    public CategoryServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }
}