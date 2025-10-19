using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Category
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual ICollection<Subcategory> Subcategories { get; set; } = new List<Subcategory>();
}
