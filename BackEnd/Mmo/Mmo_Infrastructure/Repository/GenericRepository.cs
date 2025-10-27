using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Mmo_Domain.IRepository;
using Mmo_Domain.Models;

namespace Mmo_Infrastructure.Repository;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    private readonly AppDbContext _context;
    private readonly DbSet<T> _dbSet;

    public GenericRepository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
    }

    public void Delete(int id)
    {
        var entity = _dbSet.Find(id);

        if (entity != null) _dbSet.Remove(entity);
    }

    public void Delete(T entity)
    {
        if (entity != null)
            _dbSet.Remove(entity);
    }

    public IQueryable<T> Get(Expression<Func<T, bool>>? filter = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        string includeProperties = "")
    {
        IQueryable<T> query = _dbSet;

        if (filter != null) query = query.Where(filter);

        if (!string.IsNullOrWhiteSpace(includeProperties))
            foreach (var includeProperty in includeProperties.Split(new char[] { ',' },
                         StringSplitOptions.RemoveEmptyEntries))
                query = query.Include(includeProperty);

        return orderBy != null ? orderBy(query) : query;
    }

    public IEnumerable<T> GetAll()
    {
        return _dbSet.ToList();
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<IEnumerable<T>> GetAllWithRelatedAsync()
    {
        // For Product entities, include all related entities
        if (typeof(T) == typeof(Product))
        {
            var products = await _dbSet
                .Include("Shop")
                .Include("Category")
                .Include("Subcategory")
                .Include("Productvariants")
                .Include("Feedbacks")
                .ToListAsync();
            return products as IEnumerable<T>;
        }
        
        // For other entities, just return all
        return await _dbSet.ToListAsync();
    }

    public T? GetById(int id)
    {
        return _dbSet.Find(id);
    }


    public async Task<T?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public IQueryable<T> GetQuery()
    {
        return _dbSet;
    }

    public async Task<IQueryable<T>> GetQuery(Expression<Func<T, bool>> predicate)
    {
        return await Task.FromResult(_dbSet.Where(predicate));
    }

    public void Update(T entity)
    {
        _dbSet.Update(entity);
    }
}