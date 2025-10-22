using Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services;

public class OrderServices:BaseServices<Order>,IOrderServices
{
    public OrderServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }

    public async Task<IEnumerable<OrderResponse>> GetUserOrdersAsync(int accountId)
    {
        // Lấy tất cả đơn hàng của user với thông tin liên quan
        var ordersQuery = await _unitOfWork.GenericRepository<Order>()
            .GetQuery(o => o.AccountId == accountId);
        
        var orders = ordersQuery.ToList();

        var orderResponses = new List<OrderResponse>();

        foreach (var order in orders)
        {
            // Lấy thông tin ProductVariant
            var productVariant = order.ProductVariant;
            if (productVariant == null) continue;

            // Lấy thông tin Product
            var product = productVariant.Product;
            if (product == null) continue;

            // Lấy thông tin Shop
            var shop = product.Shop;
            if (shop == null) continue;

            // Lấy thông tin Category
            var category = product.Category;
            if (category == null) continue;

            // Lấy thông tin Account của shop (seller)
            var sellerAccount = shop.Account;
            if (sellerAccount == null) continue;

            // Tính toán rating và reviews (giả sử từ Feedback)
            var feedbacks = product.Feedbacks?.ToList() ?? new List<Feedback>();
            var rating = feedbacks.Any() ? (int)Math.Round(feedbacks.Average(f => (double)f.Rating)) : 5;
            var reviews = feedbacks.Count;

            // Tính sold count (tổng quantity của tất cả orders cho product này)
            var allProductOrders = await _unitOfWork.GenericRepository<Order>()
                .GetQuery(o => o.ProductVariant != null && o.ProductVariant.ProductId == product.Id);
            var sold = allProductOrders.Sum(o => o.Quantity);

            // Tạo price range (giả sử có nhiều variants)
            var productVariants = product.Productvariants?.ToList() ?? new List<Productvariant>();
            var minPrice = productVariants.Any() ? productVariants.Min(pv => pv.Price) : productVariant.Price;
            var maxPrice = productVariants.Any() ? productVariants.Max(pv => pv.Price) : productVariant.Price;
            var priceRange = minPrice == maxPrice ? $"{minPrice:N0} ₫" : $"{minPrice:N0} ₫ - {maxPrice:N0} ₫";

            // Convert image byte array to base64 string (giả sử)
            var imageBase64 = product.Image != null ? Convert.ToBase64String(product.Image) : "";
            var imageUrl = !string.IsNullOrEmpty(imageBase64) ? $"data:image/jpeg;base64,{imageBase64}" : "/src/assets/soft2.png";

            var orderResponse = new OrderResponse
            {
                Id = order.Id,
                Name = product.Name,
                Image = imageUrl,
                Rating = rating,
                Reviews = reviews,
                Sold = sold,
                Category = category.Name,
                Seller = sellerAccount.Username,
                PriceRange = priceRange,
                TotalPrice = order.TotalPrice,
                Quantity = order.Quantity,
                Status = order.Status,
                CreatedAt = DateTime.Now // Order model không có CreatedAt field
            };

            orderResponses.Add(orderResponse);
        }

        return orderResponses.OrderByDescending(o => o.CreatedAt);
    }
}