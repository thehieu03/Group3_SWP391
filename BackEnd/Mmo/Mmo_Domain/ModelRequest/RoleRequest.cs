using System.ComponentModel.DataAnnotations;

namespace Mmo_Domain.ModelRequest;

public class RoleRequest
{
    [StringLength(50, MinimumLength = 3, ErrorMessage = "RoleName must be between 3 and 50 characters.")]
    public string RoleName { get; set; } = null!;
}