
using Mmo_Domain.IRepository;
using Mmo_Domain.Models;
using Microsoft.EntityFrameworkCore; 

namespace Mmo_Infrastructure.UnitOfWork
{
    internal class AccountRepository : IAccountRepository
    {
        private readonly AppDbContext context;

        public AccountRepository(AppDbContext context)
        {
            this.context = context;
        }

        // IAccountRepository Implementation
        public async Task<bool> CheckExistsAsync(string email, string username)
        {
            // No changes to the method itself, as the issue is resolved by adding the correct using directive
            return await context.Accounts.AnyAsync(a => a.Email == email || a.Username == username);
          
        }

        public async Task<Account?> GetByEmailAsync(string email)
        {
            return await context.Accounts.FirstOrDefaultAsync(a => a.Email == email);
        }

        // IGenericRepository<Account> Implementation
        public IEnumerable<Account> GetAll()
        {
            return context.Accounts.ToList();
        }

        public async Task<IEnumerable<Account>> GetAllAsync()
        {
            return await context.Accounts.ToListAsync();
        }

        public Account? GetById(int id)
        {
            return context.Accounts.Find(id);
        }

        public async Task<Account?> GetByIdAsync(int id)
        {
            return await context.Accounts.FindAsync(id);
        }

        public async Task AddAsync(Account entity)
        {
            await context.Accounts.AddAsync(entity);
            await context.SaveChangesAsync();
        }

        public void Update(Account entity)
        {
            context.Accounts.Update(entity);
            context.SaveChanges();
        }

        public void Delete(int id)
        {
            var entity = context.Accounts.Find(id);
            if (entity != null)
            {
                context.Accounts.Remove(entity);
                context.SaveChanges();
            }
        }

        public void Delete(Account entity)
        {
            context.Accounts.Remove(entity);
            context.SaveChanges();
        }

        public IQueryable<Account> GetQuery()
        {
            return context.Accounts.AsQueryable();
        }

        public async Task<IQueryable<Account>> GetQuery(Expression<Func<Account, bool>> predicate)
        {
            return await Task.FromResult(context.Accounts.Where(predicate));
        }

        public IQueryable<Account> Get(
            Expression<Func<Account, bool>>? filter = null,
            Func<IQueryable<Account>, IOrderedQueryable<Account>>? orderBy = null,
            string includeProperties = "")
        {
            IQueryable<Account> query = context.Accounts;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            foreach (var includeProperty in includeProperties.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }

            return orderBy != null ? orderBy(query) : query;
        }
    }
}