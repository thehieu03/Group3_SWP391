namespace Mmo_Domain.ModelResponse;

public class ShopListResponse
{
    public IEnumerable<ShopResponse> Shops { get; set; } = new List<ShopResponse>();
    public ShopStatistics Statistics { get; set; } = new ShopStatistics();
}

public class ShopStatistics
{
    public int TotalShops { get; set; }
    public int PendingShops { get; set; }
    public int ApprovedShops { get; set; }
    public int BannedShops { get; set; }
}
