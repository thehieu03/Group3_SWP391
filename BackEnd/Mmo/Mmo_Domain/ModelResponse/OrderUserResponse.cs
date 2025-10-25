namespace Mmo_Domain.ModelResponse;

public class OrderUserResponse
{
    public int OrderId { get; set; }
    public string ShopName { get; set; } = null!;
    public decimal TotalPrice { get; set; }
    public string SellerName { get; set; } = null!;
    public string? Status { get; set; }
    public DateTime? OrderDate { get; set; }
}