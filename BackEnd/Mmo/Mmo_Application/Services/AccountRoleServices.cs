namespace Mmo_Application.Services;

public class AccountRoleServices : BaseServices<Accountrole>, IAccountRoleServices
{
    public AccountRoleServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
}