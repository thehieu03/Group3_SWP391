using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Productstorage
{
    public uint Id { get; set; }

    public uint? ProductVariantId { get; set; }

    public string Result { get; set; } = null!;

    public virtual Productvariant? ProductVariant { get; set; }
}
