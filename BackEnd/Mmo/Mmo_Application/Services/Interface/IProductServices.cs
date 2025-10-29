using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services.Interface;

public interface IProductServices :IBaseServices<Product>
{
    Task<SellerProductResponse> GetSellerProductsAsync(SellerProductRequest request);
}