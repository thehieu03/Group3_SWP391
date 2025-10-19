namespace Mmo_Domain.IRepository;

public interface IGenericRepository<T> where T : class
{
    IEnumerable<T> GetAll();
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> GetAllWithRelatedAsync();
    T? GetById(int id);
    Task<T?> GetByIdAsync(int id);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(int id);
    void Delete(T entity);
    IQueryable<T> GetQuery();
    Task<IQueryable<T>> GetQuery(Expression<Func<T, bool>> predicate);
    IQueryable<T> Get(
        Expression<Func<T, bool>>? filter = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        string includeProperties = "");
}