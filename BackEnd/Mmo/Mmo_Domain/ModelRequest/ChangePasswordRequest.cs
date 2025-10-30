namespace Mmo_Domain.ModelRequest;

public class ChangePasswordRequest
{
    [Required]
    [JsonPropertyName("currentPassword")]
    public string CurrentPassword { get; set; } = null!;

    [Required]
    [JsonPropertyName("newPassword")]
    [StringLength(100, MinimumLength = 6)]
    public string NewPassword { get; set; } = null!;
}
