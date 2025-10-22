﻿using System;
using System.Collections.Generic;

namespace Mmo_Domain.Models;

public partial class Shop
{
        public int Id { get; set; }
<<<<<<< Updated upstream
        public uint? AccountId { get; set; }
=======
        public int? AccountId { get; set; }
>>>>>>> Stashed changes
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? BankName { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankAccountName { get; set; }
        public string? CitizenId { get; set; }
        public string? IdCardFrontImage { get; set; }
        public string? IdCardBackImage { get; set; }
        public int ReportCount { get; set; }
        public sbyte IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

    public virtual Account? Account { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual ICollection<Reply> Replies { get; set; } = new List<Reply>();
}