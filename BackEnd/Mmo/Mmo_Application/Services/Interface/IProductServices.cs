using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services.Interface;

public interface IProductServices :IBaseServices<Product>
{
    Task<ProductApprovalPagedResponse> GetPendingProductsAsync(ProductApprovalRequest request);
    Task<bool> ApproveProductAsync(int productId);
    Task<bool> RejectProductAsync(int productId);
}