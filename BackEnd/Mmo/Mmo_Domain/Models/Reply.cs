using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Reply
{
    public int Id { get; set; }

    public int? FeedbackId { get; set; }

    public int? ShopId { get; set; }

    public string Comment { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual Feedback? Feedback { get; set; }

    public virtual Shop? Shop { get; set; }
}
