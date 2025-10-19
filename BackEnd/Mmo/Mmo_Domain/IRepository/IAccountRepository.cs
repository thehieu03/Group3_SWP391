using Mmo_Domain.Models;

namespace Mmo_Domain.IRepository
{
    public interface IAccountRepository : IGenericRepository<Account>
    {
        Task<bool> CheckExistsAsync(string email, string username);
        Task<Account?> GetByEmailAsync(string email);
    }
}
