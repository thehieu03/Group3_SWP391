namespace Mmo_Domain.ModelResponse;

public class OrderUserResponse
{
    public int OrderId { get; set; }
    public DateTime? OrderDate { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public string ShopName { get; set; } = null!;
    public string SellerName { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Status { get; set; }
    public bool hasFeedback { get; set; } = false;
}