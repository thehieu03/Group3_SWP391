using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mmo_Domain.ModelResponse;

public class AccountResponse
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public decimal? Balance { get; set; }
    public byte[]? Avatar { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public List<string> Roles { get; set; } = new List<string>();
}
