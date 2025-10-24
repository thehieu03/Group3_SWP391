using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Imagemessage
{
    public int MessageId { get; set; }

    public byte[] Image { get; set; } = null!;

    public virtual Message Message { get; set; } = null!;
}
