
<<<<<<< Updated upstream
namespace Mmo_Application.Services;

public class SupportticketServices:BaseServices<SupportTicket>,ISupportTicketServices
=======
using Mmo_Application.Services.Interface;
using Mmo_Domain.Models;

namespace Mmo_Application.Services;

public class SupportticketServices : BaseServices<SupportTicket>, ISupportTicketServices
>>>>>>> Stashed changes
{
    public SupportticketServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }

    Task<int> ISupportTicketServices.DeleteAsync(int id)
    {
        throw new NotImplementedException();
    }

    Task<int> ISupportTicketServices.UpdateAsync(SupportTicket ticket)
    {
        throw new NotImplementedException();
    }
}