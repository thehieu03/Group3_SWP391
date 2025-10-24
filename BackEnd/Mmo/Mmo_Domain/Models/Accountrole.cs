using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Accountrole
{
    public int? AccountId { get; set; }

    public int? RoleId { get; set; }

    public virtual Account? Account { get; set; }

    public virtual Role? Role { get; set; }
}
