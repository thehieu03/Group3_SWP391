namespace Mmo_Domain.IRepository;

public interface IGenericRepository<T> where T : class
{
    IEnumerable<T> GetAll();
    Task<IEnumerable<T>> GetAllAsync();
    T? GetById(uint id);
    Task<T?> GetByIdAsync(uint id);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(uint id);
    void Delete(T entity);
    IQueryable<T> GetQuery();
    Task<IQueryable<T>> GetQuery(Expression<Func<T, bool>> predicate);
    IQueryable<T> Get(
        Expression<Func<T, bool>>? filter = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        string includeProperties = "");
}