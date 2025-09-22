using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Accountrole
{
    public uint? AccountId { get; set; }

    public uint? RoleId { get; set; }

    public virtual Account? Account { get; set; }

    public virtual Role? Role { get; set; }
}
