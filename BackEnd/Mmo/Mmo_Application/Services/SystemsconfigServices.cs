namespace Mmo_Application.Services;

public class SystemsconfigServices: BaseServices<Systemsconfig>, ISystemsconfigServices
{
    public SystemsconfigServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }
}
