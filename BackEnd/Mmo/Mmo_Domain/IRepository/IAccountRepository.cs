using Mmo_Domain.Models;
using System.Threading.Tasks;

namespace Mmo_Domain.Repository
{
    public interface IAccountRepository
    {
        Task<Account?> GetByIdAsync(int id);
        Task UpdateAsync(Account account);
    }
}
