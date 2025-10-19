using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Message
{
    public int Id { get; set; }

    public int SenderId { get; set; }

    public int ReceiverId { get; set; }

    public string Type { get; set; } = null!;

    public DateTime? SendAt { get; set; }

    public virtual Imagemessage? Imagemessage { get; set; }

    public virtual Account Receiver { get; set; } = null!;

    public virtual Account Sender { get; set; } = null!;

    public virtual Textmessage? Textmessage { get; set; }
}
