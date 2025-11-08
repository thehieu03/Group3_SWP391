namespace Mmo_Application.Services;

public class FeedbackServices : BaseServices<Feedback>, IFeedbackServices
{
    public FeedbackServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Feedback>> GetByProductIdAsync(int productId)
    {
        var query = _unitOfWork.GenericRepository<Feedback>().Get(
            filter: f => f.ProductId == productId,
            orderBy: q => q.OrderByDescending(f => f.CreatedAt),
            includeProperties: "Account"
        );
        return await Task.FromResult(query.ToList());
    }
}