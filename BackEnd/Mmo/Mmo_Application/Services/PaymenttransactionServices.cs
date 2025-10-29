namespace Mmo_Application.Services;

public class PaymenttransactionServices : BaseServices<Paymenttransaction>, IPaymenttransactionServices
{
    public PaymenttransactionServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
}