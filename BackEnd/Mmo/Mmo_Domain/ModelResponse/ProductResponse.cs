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

    public uint? SubcategoryId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public byte[]? Image { get; set; }

    public bool? IsActive { get; set; }

    public string? Details { get; set; }

    public decimal? Fee { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? ShopName { get; set; }
    public string? CategoryName { get; set; }
    public string? SubcategoryName { get; set; }
    

    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int TotalStock { get; set; }
    public int TotalSold { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public double ComplaintRate { get; set; }
}
