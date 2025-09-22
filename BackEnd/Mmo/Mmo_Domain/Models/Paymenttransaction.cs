using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Paymenttransaction
{
    public uint Id { get; set; }

    public uint? UserId { get; set; }

    public string Type { get; set; } = null!;

    public decimal Amount { get; set; }

    public string PaymentDescription { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual Account? User { get; set; }
}
