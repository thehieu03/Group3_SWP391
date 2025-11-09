namespace Mmo_Application.Services.Interface;

public interface ISubcategoryServices : IBaseServices<Subcategory>
{
    Task<bool> DeactivateSubcategoriesByCategoryIdAsync(int categoryId);
}


