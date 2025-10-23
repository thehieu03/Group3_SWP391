namespace Mmo_Domain.ModelRequest;

public class UpdateShopStatusRequest
{
    public int ShopId { get; set; }
    public bool IsActive { get; set; }
}
