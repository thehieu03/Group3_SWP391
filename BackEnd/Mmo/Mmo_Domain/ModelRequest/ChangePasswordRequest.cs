namespace Mmo_Domain.ModelRequest;

public class ChangePasswordRequest
{
    [Required(ErrorMessage = "Account ID is required")]
    [JsonPropertyName("accountId")]
    public int AccountId { get; set; }

    [Required(ErrorMessage = "New password is required")]
    [JsonPropertyName("password")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "New password must be between 6 and 100 characters")]
    public string NewPassword { get; set; } = null!;
}
