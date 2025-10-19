using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;
using Mmo_Domain.ModelResponse.Mmo_Domain.ModelResponse;
using Mmo_Domain.Models;
using System.Threading.Tasks;

namespace Mmo_Domain.IRepository
{
    public interface IAccountRepository : IGenericRepository<Account>
    {
  
        Task<bool> CheckExistsAsync(string email, string username);

    
        Task<Account?> GetByEmailAsync(string email);

    }

  
}