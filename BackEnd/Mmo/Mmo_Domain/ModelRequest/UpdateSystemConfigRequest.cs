using System.ComponentModel.DataAnnotations;

namespace Mmo_Domain.ModelRequest;

public class UpdateSystemConfigRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Email must contain @ and be in valid format (e.g., user@example.com)")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Fee is required")]
    [Range(0, double.MaxValue, ErrorMessage = "Fee must be a non-negative number")]
    public decimal Fee { get; set; }

    [Required(ErrorMessage = "Google App Password is required")]
    [MinLength(1, ErrorMessage = "Google App Password cannot be empty")]
    public string GoogleAppPassword { get; set; } = null!;
}

