using Mmo_Domain.ModelRequest;

namespace Mmo_Application.Services.Interface;

public interface IProductVariantServices:IBaseServices<Productvariant>
{
    Task<IEnumerable<Productvariant>> GetByProductIdAsync(int productId);
    Task<(bool Success, string? ErrorMessage, int? VariantId)> CreateProductVariantAsync(ProductVariantRequest request);
    Task<(bool Success, string? ErrorMessage)> UpdateProductVariantAsync(int variantId, ProductVariantRequest request);
}
