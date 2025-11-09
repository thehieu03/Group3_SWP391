using Mmo_Domain.ModelResponse;

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

    public async Task<IEnumerable<Order>> GetShopOrdersAsync(int shopId)
    {
        // Lấy tất cả products của shop
        var products = await _unitOfWork.GenericRepository<Product>()
            .Get(p => p.ShopId == shopId)
            .Select(p => p.Id)
            .ToListAsync();

        if (!products.Any())
            return new List<Order>();

        // Lấy tất cả product variants của các products đó
        var productVariants = await _unitOfWork.GenericRepository<Productvariant>()
            .Get(pv => products.Contains(pv.ProductId ?? 0))
            .Select(pv => pv.Id)
            .ToListAsync();

        if (!productVariants.Any())
            return new List<Order>();

        // Lấy tất cả orders của các product variants đó
        var orders = await _unitOfWork.GenericRepository<Order>()
            .Get(
                o => productVariants.Contains(o.ProductVariantId ?? 0),
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