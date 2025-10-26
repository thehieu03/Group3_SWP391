namespace Mmo_Application.Services;

public class SupportticketServices:BaseServices<Supportticket>,ISupportticketServices
{
    public SupportticketServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }
}
