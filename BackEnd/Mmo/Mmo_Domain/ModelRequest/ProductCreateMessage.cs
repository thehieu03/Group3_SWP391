using System.Text.Json;

namespace Mmo_Domain.ModelRequest;

public class ProductCreateMessage
{
    public int? ShopId { get; set; }
    public int? CategoryId { get; set; }
    public int? SubcategoryId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Details { get; set; }
    public string? ImageUrl { get; set; }
    public List<ProductVariantMessage>? Variants { get; set; }

    public string ToJson()
    {
        return JsonSerializer.Serialize(this);
    }

    public static ProductCreateMessage? FromJson(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<ProductCreateMessage>(json);
        }
        catch
        {
            return null;
        }
    }
}

public class ProductVariantMessage
{
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public int? Stock { get; set; }
    public List<ProductStorageMessage>? Storages { get; set; }
}

public class ProductStorageMessage
{
    public string Result { get; set; } = null!; // JSON string chứa username, password, status
}

