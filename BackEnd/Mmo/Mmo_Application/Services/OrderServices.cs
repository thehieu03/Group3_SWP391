namespace Mmo_Application.Services;

public class OrderServices : BaseServices<Order>, IOrderServices
{
    public OrderServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
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
}