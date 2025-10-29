namespace Mmo_Domain.ModelResponse;

public class SellerDashboardResponse
{
    public int ShopId { get; set; }
    public string ShopName { get; set; } = string.Empty;

    // Summary metrics
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingOrders { get; set; }

    // Recent items
    public List<SellerRecentOrderItem> RecentOrders { get; set; } = new();

    // Pagination
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public int TotalItems { get; set; }
    public int ItemsPerPage { get; set; }
}

public class SellerRecentOrderItem
{
    public int OrderId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? ProductName { get; set; }
    public string? VariantName { get; set; }
    public string? CategoryName { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Status { get; set; }
}


