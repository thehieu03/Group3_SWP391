namespace Mmo_Domain.ModelRequest;

public class SystemConfigRequest
{
    public string Email { get; set; } = null!;
    public decimal? Fee { get; set; }
    public string GoogleAppPassword { get; set; } = null!;
}

