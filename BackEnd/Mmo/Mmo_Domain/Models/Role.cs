using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Role
{
    public uint Id { get; set; }

    public string RoleName { get; set; } = null!;
}
