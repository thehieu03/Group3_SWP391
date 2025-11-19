using System.ComponentModel.DataAnnotations;

namespace Mmo_Domain.ModelRequest;

public class ProductVariantStorageItem
{
    public string? Result { get; set; } // JSON string chứa account data
}

public class ProductVariantRequest
{
    public int? ProductId { get; set; } // Nullable for update operations

    public int? Id { get; set; } // Variant ID for update operations

    [MaxLength(100)]
    public string? Name { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Price must be greater than or equal to 0")]
    public decimal? Price { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Stock must be greater than or equal to 0")]
    public int? Stock { get; set; }

    // Storages được gửi từ frontend dưới dạng array với field "result" chứa JSON string
    public List<ProductVariantStorageItem>? Storages { get; set; }
}

