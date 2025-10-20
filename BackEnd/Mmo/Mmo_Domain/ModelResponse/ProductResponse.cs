using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mmo_Domain.ModelResponse;

public class ProductResponse
{
    public uint Id { get; set; }

    public uint? ShopId { get; set; }

    public uint? CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public byte[]? Image { get; set; }

    public bool? IsActive { get; set; }

    public string? Details { get; set; }

    public CategoryResponse? Category { get; set; }
    public ShopResponse? Shop { get; set; }

    public List<ProductVariantResponse>? ProductVariants { get; set; }
}

public class ProductVariantResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? Name { get; set; }
    public decimal? Price { get; set; }
    public bool IsActive { get; set; }
}
