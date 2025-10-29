using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mmo_Domain.ModelRequest;

public class SellerProductRequest
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; } = "CreatedAt";
    public string? SortDirection { get; set; } = "desc";
    public string? SearchProductName { get; set; }
    public int? CategoryId { get; set; }
    public bool? IsActive { get; set; }
    public int ShopId { get; set; }
}


