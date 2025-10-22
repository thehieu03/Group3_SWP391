namespace Mmo_Domain.ModelResponse;

public class DashboardResponse
{
    // Thống kê tổng quan
    public int TotalActiveUsers { get; set; }
    public int TotalActiveShops { get; set; }
    public int TotalSubcategories { get; set; }
    public int TotalTransactions { get; set; }
    public int TotalPendingSupportTickets { get; set; }

    // Thông báo
    public List<NotificationItem> Notifications { get; set; } = new List<NotificationItem>();
}

public class NotificationItem
{
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int Count { get; set; }
}
