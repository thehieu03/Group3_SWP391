using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Textmessage
{
    public uint MessageId { get; set; }

    public string Content { get; set; } = null!;

    public virtual Message Message { get; set; } = null!;
}
