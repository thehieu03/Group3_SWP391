namespace Mmo_Domain.IUnit;

public interface IUnitOfWork
{
    IGenericRepository<TEntity> GenericRepository<TEntity>() where TEntity : class;
    int SaveChanges();
    Task<int> SaveChangeAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
