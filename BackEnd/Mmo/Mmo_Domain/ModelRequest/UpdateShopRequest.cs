namespace Mmo_Domain.ModelRequest;

public class UpdateShopRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
}

