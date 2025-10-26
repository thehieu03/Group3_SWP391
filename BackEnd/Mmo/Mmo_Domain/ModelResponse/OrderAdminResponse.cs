namespace Mmo_Domain.ModelResponse;

public class OrderAdminResponse
{
    public int OrderId { get; set; }
    public string ShopName { get; set; } = null!;
    public decimal TotalPrice { get; set; }
    public int Quantity { get; set; }
    public string BuyerName { get; set; } = null!;
    public string SellerName { get; set; } = null!;
    public string? Status { get; set; }
    public DateTime? OrderDate { get; set; }
}
