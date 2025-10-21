using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Systemsconfig
{
    public string Email { get; set; } = null!;

    public decimal Fee { get; set; }

    public string GoogleAppPassword { get; set; } = null!;
}
