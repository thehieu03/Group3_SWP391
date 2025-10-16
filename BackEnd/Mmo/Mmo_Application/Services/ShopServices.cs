namespace Mmo_Application.Services;

public class ShopServices :BaseServices<Shop>, IShopServices
{
    public ShopServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }
}