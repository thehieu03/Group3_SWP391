namespace Mmo_Application.Services.Interface;

public interface IProductServices :IBaseServices<Product>
{
    Task<IEnumerable<Product>> GetAllWithRelatedAsync();
}