namespace Mmo_Domain.ModelResponse;

public class ShopResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Status { get; set; } = null;
    public bool IsActive { get; set; } // Map từ Status: "APPROVED" = true, các status khác = false

    public string OwnerUsername { get; set; } = null!;
    public int? ProductCount { get; set; }
    public int? ComplaintCount { get; set; }
    public string? IdentificationFurl { get; set; }
    public string? IdentificationBurl { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}