using System.ComponentModel.DataAnnotations;

namespace Mmo_Domain.ModelRequest;

public class SubcategoryRequest
{
    [Required]
    public int CategoryId { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = null!;
}
