namespace Mmo_Application.Services;

public class FeedbackServices    :BaseServices<Feedback>,IFeedbackServices
{
    public FeedbackServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }
}
