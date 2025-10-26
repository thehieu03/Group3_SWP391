using System.ComponentModel.DataAnnotations;

namespace Mmo_Domain.ModelRequest;

public class RegisterRequest
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username { get; set; } = null!;

    [EmailAddress]
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Email { get; set; } = null!;

    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string Password { get; set; } = null!;
}
