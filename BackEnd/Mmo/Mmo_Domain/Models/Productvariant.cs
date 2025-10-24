using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Productvariant
{
    public int Id { get; set; }

    public int? ProductId { get; set; }

    public string Name { get; set; } = null!;

    public decimal Price { get; set; }

    public int? Stock { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual Product? Product { get; set; }

    public virtual ICollection<Productstorage> Productstorages { get; set; } = new List<Productstorage>();
}
