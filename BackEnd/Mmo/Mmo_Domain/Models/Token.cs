using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Token
{
    public uint Id { get; set; }

    public uint? AccountId { get; set; }

    public string RefreshToken { get; set; } = null!;

    public string AccessToken { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Account? Account { get; set; }
}
