namespace Mmo_Domain.ModelRequest
{
    public class RegisterShopRequest
    {
        public uint? AccountId { get; set; }
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
    }
<<<<<<< Updated upstream
}
=======
}
>>>>>>> Stashed changes
