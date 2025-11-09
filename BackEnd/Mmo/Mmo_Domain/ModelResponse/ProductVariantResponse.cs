namespace Mmo_Domain.ModelResponse;

public class ProductVariantResponse
{
    public int Id { get; set; }

    public int? ProductId { get; set; }

    public string Name { get; set; } = null!;

    public decimal Price { get; set; }

    public int? Stock { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}

