using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Paymenttransaction
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public string Type { get; set; } = null!;

    public decimal Amount { get; set; }

    public string PaymentDescription { get; set; } = null!;

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? ReferenceCode { get; set; }

    public string? RawPayload { get; set; }

    public virtual Account? User { get; set; }
}
