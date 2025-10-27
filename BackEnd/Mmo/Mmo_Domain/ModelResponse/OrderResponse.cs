namespace Mmo_Domain.ModelResponse;

public class OrderResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Image { get; set; } = null!;
    public int Rating { get; set; }
    public int Reviews { get; set; }
    public int Sold { get; set; }
    public string Category { get; set; } = null!;
    public string Seller { get; set; } = null!;
    public string PriceRange { get; set; } = null!;
    public decimal TotalPrice { get; set; }
    public int Quantity { get; set; }
    public string? Status { get; set; }
    public DateTime? CreatedAt { get; set; }
}
