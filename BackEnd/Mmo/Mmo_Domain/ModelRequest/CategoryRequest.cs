using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Mmo_Domain.ModelRequest;

public class CategoryRequest
{
    [JsonPropertyName("categoryName")]
    [MaxLength(100, ErrorMessage = "The Name field must be a maximum length of 100 characters.")]
    [Required(ErrorMessage = "The Name field is required.")]
    public string Name { get; set; } = null!;
}
