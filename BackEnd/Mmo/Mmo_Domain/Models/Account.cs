using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Account
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string? Password { get; set; }

    public string? Phone { get; set; }

    public string Email { get; set; } = null!;

    public decimal? Balance { get; set; }

    public string? GoogleId { get; set; }

    public string? IdentificationFurl { get; set; }

    public DateTime? IdentificationFuploadedAt { get; set; }

    public string? IdentificationBurl { get; set; }

    public DateTime? IdentificationBuploadedAt { get; set; }

    public string? ImageUrl { get; set; }

    public DateTime? ImageUploadedAt { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<Message> MessageReceivers { get; set; } = new List<Message>();

    public virtual ICollection<Message> MessageSenders { get; set; } = new List<Message>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Paymenttransaction> Paymenttransactions { get; set; } = new List<Paymenttransaction>();

    public virtual ICollection<Shop> Shops { get; set; } = new List<Shop>();

    public virtual ICollection<Supportticket> Supporttickets { get; set; } = new List<Supportticket>();

    public virtual ICollection<Token> Tokens { get; set; } = new List<Token>();
}
