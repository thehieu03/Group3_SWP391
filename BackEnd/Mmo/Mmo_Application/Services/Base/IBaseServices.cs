namespace Mmo_Application.Services;

public interface  IBaseServices<T> where T : class
{
    Task<int> AddAsync(T entity);
    Task<bool> UpdateAsync(T entity);
    bool Delete(int id);
    Task<bool> DeleteAsync(int id);
    Task<bool> DeleteAsync(T entity);
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
}