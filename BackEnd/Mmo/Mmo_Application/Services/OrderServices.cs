namespace Mmo_Application.Services;

public class OrderServices : BaseServices<Order>, IOrderServices
{
    public OrderServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Order>> GetUserOrdersAsync(int accountId)
    {
        var orders = await _unitOfWork.GenericRepository<Order>()
            .Get(
                o => o.AccountId == accountId,
                includeProperties:
                "ProductVariant.Product.Shop.Account,ProductVariant.Product.Category,ProductVariant.Product.Subcategory"
            ).ToListAsync();
        return orders;
    }

    public async Task<IEnumerable<Order>> AdminGetAllOrderAsync()
    {
        var orders = await _unitOfWork.GenericRepository<Order>()
            .Get(
                includeProperties:
                "Account,ProductVariant.Product.Shop.Account,ProductVariant.Product.Category,ProductVariant.Product.Subcategory"
            ).ToListAsync();
        return orders;
    }

    public async Task<bool> HasFeedbackAsync(int orderId)
    {
        var feedback = await _unitOfWork.GenericRepository<Feedback>()
            .Get(f => f.OrderId == orderId)
            .FirstOrDefaultAsync();

        return feedback != null;
    }
}