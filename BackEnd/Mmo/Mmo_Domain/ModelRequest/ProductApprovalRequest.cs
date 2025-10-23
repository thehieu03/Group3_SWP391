using System.ComponentModel.DataAnnotations;

namespace Mmo_Domain.ModelRequest;

public class ProductApprovalRequest
{
    /// <summary>
    /// Tìm kiếm theo tên sản phẩm
    /// </summary>
    public string? SearchProductName { get; set; }

    /// <summary>
    /// Tìm kiếm theo tên shop
    /// </summary>
    public string? SearchShopName { get; set; }

    /// <summary>
    /// Lọc theo category ID
    /// </summary>
    public int? CategoryId { get; set; }

    /// <summary>
    /// Sort theo field (Name, CreatedAt)
    /// </summary>
    public string? SortBy { get; set; } = "CreatedAt";

    /// <summary>
    /// Sort direction (asc, desc)
    /// </summary>
    public string? SortDirection { get; set; } = "desc";

    /// <summary>
    /// Số trang hiện tại
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "Page number must be at least 1")]
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Số item trên mỗi trang
    /// </summary>
    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
    public int PageSize { get; set; } = 10;
}

