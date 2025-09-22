using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Feedback
{
    public uint Id { get; set; }

    public uint? AccountId { get; set; }

    public uint? ProductId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Account? Account { get; set; }

    public virtual Product? Product { get; set; }

    public virtual ICollection<Reply> Replies { get; set; } = new List<Reply>();
}
