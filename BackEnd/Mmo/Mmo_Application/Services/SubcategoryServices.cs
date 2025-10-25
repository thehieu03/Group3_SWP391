namespace Mmo_Application.Services;

public class SubcategoryServices : BaseServices<Subcategory>, ISubcategoryServices
{
    public SubcategoryServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }

    public async Task<bool> DeactivateSubcategoriesByCategoryIdAsync(int categoryId)
    {
        try
        {
            var subcategories = await GetAllAsync();
            var categorySubcategories = subcategories.Where(s => s.CategoryId == categoryId && s.IsActive == true).ToList();
            
            foreach (var subcategory in categorySubcategories)
            {
                subcategory.IsActive = false;
                subcategory.UpdatedAt = DateTime.UtcNow;
                await UpdateAsync(subcategory);
            }
            
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }
}


