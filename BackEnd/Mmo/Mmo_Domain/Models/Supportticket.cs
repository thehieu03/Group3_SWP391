using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Supportticket
{
    public uint Id { get; set; }

    public uint? AccountId { get; set; }

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual Account? Account { get; set; }
}
