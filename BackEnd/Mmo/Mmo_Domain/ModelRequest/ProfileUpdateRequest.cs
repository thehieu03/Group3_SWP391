namespace Mmo_Domain.ModelRequest;

public class ProfileUpdateRequest
{
    [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters")]
    public string? Username { get; set; }

    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
    public string? Email { get; set; }

    [StringLength(15, ErrorMessage = "Phone cannot exceed 15 characters")]
    [RegularExpression(@"^[0-9+\-\s()]*$", ErrorMessage = "Phone number contains invalid characters")]
    public string? Phone { get; set; }
}