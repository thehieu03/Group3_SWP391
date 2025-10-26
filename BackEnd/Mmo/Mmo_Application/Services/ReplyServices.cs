namespace Mmo_Application.Services;

public class ReplyServices:BaseServices<Reply>,IReplyServices
{
    public ReplyServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }
}
