
namespace Mmo_Application.Services;

public class SupportticketServices:BaseServices<SupportTicket>,ISupportTicketServices
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