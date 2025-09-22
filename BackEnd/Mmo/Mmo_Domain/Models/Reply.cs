using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Reply
{
    public uint Id { get; set; }

    public uint? FeedbackId { get; set; }

    public uint? ShopId { get; set; }

    public string Comment { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual Feedback? Feedback { get; set; }

    public virtual Shop? Shop { get; set; }
}
