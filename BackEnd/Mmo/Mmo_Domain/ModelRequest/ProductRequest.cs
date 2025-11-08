using System.ComponentModel.DataAnnotations;

namespace Mmo_Domain.ModelRequest;

public class ProductRequest
{
    [Required]
    public int? ShopId { get; set; }
    
    [Required]
    public int? CategoryId { get; set; }

    public int? SubcategoryId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = null!;
    
    [Required]
    [MaxLength(500)]
    public string? Description { get; set; }

    public string? Details { get; set; }
    
    public List<ProductVariantRequest>? Variants { get; set; }
}
