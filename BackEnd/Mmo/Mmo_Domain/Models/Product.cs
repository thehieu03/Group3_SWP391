using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Product
{
    public int Id { get; set; }

    public int? ShopId { get; set; }

    public int? CategoryId { get; set; }

    public int? SubcategoryId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public byte[]? Image { get; set; }

    public bool? IsActive { get; set; }

    public string? Details { get; set; }

    public decimal? Fee { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Category? Category { get; set; }

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<Productvariant> Productvariants { get; set; } = new List<Productvariant>();

    public virtual Shop? Shop { get; set; }

    public virtual Subcategory? Subcategory { get; set; }
}
