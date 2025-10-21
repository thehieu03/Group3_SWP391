namespace Mmo_Domain.ModelResponse;

public class UserResponse
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public decimal? Balance { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public List<string> Roles { get; set; } = new List<string>();
}
