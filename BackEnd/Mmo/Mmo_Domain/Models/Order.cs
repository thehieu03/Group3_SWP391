using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Order
{
    public int Id { get; set; }

    public int? AccountId { get; set; }

    public int? ProductVariantId { get; set; }

    public decimal TotalPrice { get; set; }

    public int Quantity { get; set; }

    /// <summary>
    /// Thông tin tài khoản sản phẩm (username, password, etc.)
    /// </summary>
    public string? Payload { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Account? Account { get; set; }

    public virtual Feedback? Feedback { get; set; }

    public virtual Productvariant? ProductVariant { get; set; }
}
