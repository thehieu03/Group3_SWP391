using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Token
{
    public int Id { get; set; }

    public int? AccountId { get; set; }

    public string? RefreshToken { get; set; }

    public string? AccessToken { get; set; }

    public DateTime ExpiresAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Account? Account { get; set; }
}
