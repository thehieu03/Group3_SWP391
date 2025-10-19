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

    public string? Status { get; set; }

    public virtual Account? Account { get; set; }

    public virtual Productvariant? ProductVariant { get; set; }
}
