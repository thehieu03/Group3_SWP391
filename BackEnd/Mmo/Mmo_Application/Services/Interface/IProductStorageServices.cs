using Mmo_Domain.ModelRequest;

namespace Mmo_Application.Services.Interface;

public interface IProductStorageServices :IBaseServices<Productstorage>
{
    Task<(bool Success, string? ErrorMessage, int? StorageCount)> CreateProductStoragesAsync(ProductStorageRequest request);
    Task<IEnumerable<Productstorage>> GetStoragesByVariantIdAsync(int productVariantId);
    Task<(bool Success, string? ErrorMessage)> UpdateStorageStatusAsync(int storageId, UpdateStorageStatusRequest request);
    Task<(bool IsValid, string? ErrorMessage)> ValidateProductStorageRequestAsync(ProductStorageRequest request);
}
