using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Productstorage
{
    public int Id { get; set; }

    public int? ProductVariantId { get; set; }

    public string Result { get; set; } = null!;

    public virtual Productvariant? ProductVariant { get; set; }
}
