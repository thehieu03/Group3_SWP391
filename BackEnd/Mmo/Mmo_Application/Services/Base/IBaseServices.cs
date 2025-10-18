namespace Mmo_Application.Services;

public interface  IBaseServices<T> where T : class
{
    Task<int> AddAsync(T entity);
    Task<bool> UpdateAsync(T entity);
    bool Delete(uint id);
    Task<bool> DeleteAsync(uint id);
    Task<bool> DeleteAsync(T entity);
    Task<T?> GetByIdAsync(uint id);
    Task<IEnumerable<T>> GetAllAsync();
}