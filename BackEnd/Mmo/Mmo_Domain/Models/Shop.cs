using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Shop
{
    public uint Id { get; set; }

    public uint? AccountId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public int? ReportCount { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Account? Account { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual ICollection<Reply> Replies { get; set; } = new List<Reply>();
}
