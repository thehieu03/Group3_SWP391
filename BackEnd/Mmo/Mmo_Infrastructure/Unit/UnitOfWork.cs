using Mmo_Domain.IUnit; 
using Mmo_Domain.IRepository;
using Mmo_Infrastructure.Repository;
using System.Threading.Tasks;

namespace Mmo_Infrastructure.Unit
{
   
    public class UnitOfWork : IUnitOfWork
    {

        private readonly AppDbContext _context;

  
        public IAccountRepository Accounts { get; private set; }
        

        public UnitOfWork(AppDbContext context)
        {
            _context = context;

          
            Accounts = new AccountRepository(_context);
          
        }

     
        public IGenericRepository<T> GenericRepository<T>() where T : class
        {
            return new GenericRepository<T>(_context);
        }

       
        public int SaveChanges()
        {
            return _context.SaveChanges();
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

         
        public void Dispose()
        {
            _context.Dispose();
        }
    }
}