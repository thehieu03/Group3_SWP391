namespace Mmo_Application.Services;

public class MessageServices : BaseServices<Message>, IMessageServices
{
    public MessageServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
}