namespace Mmo_Domain.ModelRequest;

public class ProductRequest
{
    [Required]
    public uint? ShopId { get; set; }
    [Required]

    public uint? CategoryId { get; set; }
    [Required]
    [MaxLength(100)]

    public string Name { get; set; } = null!;
    [Required]
    [MaxLength(500)]

    public string? Description { get; set; }

    public byte[]? Image { get; set; }
    public string? Details { get; set; }
}
