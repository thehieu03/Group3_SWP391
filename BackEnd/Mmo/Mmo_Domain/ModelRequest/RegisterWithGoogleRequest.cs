using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Mmo_Domain.ModelRequest;

public class RegisterWithGoogleRequest
{
    [JsonPropertyName("email")]
    [StringLength(100, MinimumLength = 3)]
    [EmailAddress]
    [Required]
    public string Email { get; set; } = null!;

    [JsonPropertyName("id")]
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string GoogleId { get; set; } = null!;

    [JsonPropertyName("name")]
    [StringLength(100, MinimumLength = 3)]
    [Required]
    public string? Username { get; set; }

    [JsonPropertyName("picture")]
    [StringLength(200, MinimumLength = 3)]
    [Required]
    public string Image { get; set; } = null!;
}
