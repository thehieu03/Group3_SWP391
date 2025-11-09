using System.ComponentModel.DataAnnotations;

namespace Mmo_Domain.ModelRequest;

public class CreateDepositRequest
{
    [Required(ErrorMessage = "Amount is required")]
    [Range(1000, double.MaxValue, ErrorMessage = "Amount must be at least 1,000 VNĐ")]
    public decimal Amount { get; set; }
}

