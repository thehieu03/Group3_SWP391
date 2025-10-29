using System;
using System.Collections.Generic;

namespace Mmo_Domain.ModelResponse;

public class ProductApprovalResponse
{
    public int Id { get; set; }
    public string ProductName { get; set; } = null!;
    public string? Description { get; set; }
    public int? ShopId { get; set; }
    public string ShopName { get; set; } = null!;
    public string? ShopOwnerName { get; set; }
    public byte[]? Image { get; set; }
    public string? Details { get; set; }
    public decimal? Fee { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsApproved { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
}

public class ProductApprovalPagedResponse
{
    public List<ProductApprovalResponse> Products { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage { get; set; }
    public bool HasNextPage { get; set; }
}

