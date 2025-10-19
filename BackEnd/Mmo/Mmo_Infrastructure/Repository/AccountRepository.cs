using Mmo_Domain.IRepository;
using Mmo_Domain.Models; 
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Mmo_Infrastructure.Repository
{
    public class AccountRepository : GenericRepository<Account>, IAccountRepository
    {
        private readonly AppDbContext _context;

        
        public AccountRepository(AppDbContext context) : base(context)
        {
            _context = context; 
        }

        public async Task<bool> CheckExistsAsync(string email, string username)
        {
            return await _context.Accounts
                .AnyAsync(a => a.Email == email || a.Username == username);
        }

        public async Task<Account?> GetByEmailAsync(string email)
        {
            return await _context.Accounts
                .FirstOrDefaultAsync(a => a.Email == email);
        }
    }
}