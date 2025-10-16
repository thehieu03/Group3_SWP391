using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Order
{
    public uint Id { get; set; }

    public uint? AccountId { get; set; }

    public uint? ProductVariantId { get; set; }

    public decimal TotalPrice { get; set; }

    public int Quantity { get; set; }

    public string? Status { get; set; }

    public virtual Account? Account { get; set; }

    public virtual Productvariant? ProductVariant { get; set; }
}
