namespace Mmo_Domain.ModelResponse;

public class ShopResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Status { get; set; } = null;

    public string OwnerUsername { get; set; } = null!;
    public int? ProductCount { get; set; }
    public int? ComplaintCount { get; set; }
    public byte[] IdentificationF { get; set; } = null!;

    public byte[] IdentificationB { get; set; } = null!;
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}