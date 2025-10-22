using Mmo_Domain.Models;

namespace Mmo_Application.Services.Interface;

public interface ISupportTicketServices
{
    Task<IEnumerable<SupportTicket>> GetAllAsync();
    Task<SupportTicket?> GetByIdAsync(int id);
    Task<int> AddAsync(SupportTicket ticket);
    Task<int> UpdateAsync(SupportTicket ticket);
    Task<int> DeleteAsync(int id);
<<<<<<< Updated upstream
}
=======
}
>>>>>>> Stashed changes
