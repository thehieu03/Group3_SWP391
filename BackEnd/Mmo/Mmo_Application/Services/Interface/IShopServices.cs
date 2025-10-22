using Mmo_Domain.Models;

namespace Mmo_Application.Services.Interface;

public interface IShopServices : IBaseServices<Shop>
{
    Task<IEnumerable<Shop>> GetAllWithDetailsAsync();
}