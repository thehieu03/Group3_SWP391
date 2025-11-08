using System.Text.Json;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.Models;

namespace Mmo_Application.Services;

public class ProductStorageServices : BaseServices<Productstorage>, IProductStorageServices
{
    public ProductStorageServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public Task<(bool IsValid, string? ErrorMessage)> ValidateProductStorageRequestAsync(ProductStorageRequest request)
    {
        if (request == null)
            return Task.FromResult<(bool IsValid, string? ErrorMessage)>((false, "Request is null"));

        if (request.Accounts == null || request.Accounts.Count == 0)
            return Task.FromResult<(bool IsValid, string? ErrorMessage)>((false, "Accounts list cannot be empty"));

        // Validate each account has required fields
        foreach (var account in request.Accounts)
        {
            if (string.IsNullOrWhiteSpace(account.Username))
                return Task.FromResult<(bool IsValid, string? ErrorMessage)>((false, "Username is required for all accounts"));

            if (string.IsNullOrWhiteSpace(account.Password))
                return Task.FromResult<(bool IsValid, string? ErrorMessage)>((false, "Password is required for all accounts"));
        }

        return Task.FromResult<(bool IsValid, string? ErrorMessage)>((true, null));
    }

    public async Task<(bool Success, string? ErrorMessage, int? StorageCount)> CreateProductStoragesAsync(ProductStorageRequest request)
    {
        // Validate request
        var validation = await ValidateProductStorageRequestAsync(request);
        if (!validation.IsValid)
            return (false, validation.ErrorMessage, null);

        // Validate ProductVariant exists
        var variant = await _unitOfWork.GenericRepository<Productvariant>().GetByIdAsync(request.ProductVariantId);
        if (variant == null)
            return (false, "Product variant not found", null);

        var expectedStorageCount = request.Accounts.Count;

        // Create storage for each account
        var storages = new List<Productstorage>();
        foreach (var account in request.Accounts)
        {
            var accountData = new
            {
                username = account.Username,
                password = account.Password,
                status = account.Status
            };

            var storage = new Productstorage
            {
                ProductVariantId = request.ProductVariantId,
                Result = JsonSerializer.Serialize(accountData)
            };

            storages.Add(storage);
        }

        // Add all storages
        foreach (var storage in storages)
        {
            await _unitOfWork.GenericRepository<Productstorage>().AddAsync(storage);
        }

        var saveResult = await _unitOfWork.SaveChangeAsync();
        if (saveResult <= 0)
            return (false, "Failed to save storages to database", null);

        // Verify số lượng storages đã tạo phải khớp với số lượng accounts
        var createdStorages = await GetStoragesByVariantIdAsync(request.ProductVariantId);
        var actualStorageCount = createdStorages.Count();

        if (actualStorageCount != expectedStorageCount)
        {
            return (false, $"Số lượng storages đã tạo ({actualStorageCount}) không khớp với số lượng accounts ({expectedStorageCount})", actualStorageCount);
        }

        return (true, null, actualStorageCount);
    }

    public async Task<IEnumerable<Productstorage>> GetStoragesByVariantIdAsync(int productVariantId)
    {
        return await _unitOfWork.GenericRepository<Productstorage>()
            .Get(filter: s => s.ProductVariantId == productVariantId)
            .ToListAsync();
    }

    public async Task<(bool Success, string? ErrorMessage)> UpdateStorageStatusAsync(int storageId, UpdateStorageStatusRequest request)
    {
        if (request == null || storageId != request.StorageId)
            return (false, "Invalid request");

        var storage = await _unitOfWork.GenericRepository<Productstorage>().GetByIdAsync(storageId);
        if (storage == null)
            return (false, "Storage not found");

        try
        {
            // Parse existing result
            var jsonDoc = JsonDocument.Parse(storage.Result);
            var root = jsonDoc.RootElement;

            // Validate required fields exist
            if (!root.TryGetProperty("username", out _) || !root.TryGetProperty("password", out _))
                return (false, "Storage result does not contain required fields (username, password)");

            // Update status
            var updatedAccount = new
            {
                username = root.GetProperty("username").GetString(),
                password = root.GetProperty("password").GetString(),
                status = request.Status
            };

            // Update storage result
            storage.Result = JsonSerializer.Serialize(updatedAccount);

            _unitOfWork.GenericRepository<Productstorage>().Update(storage);
            var result = await _unitOfWork.SaveChangeAsync();

            if (result <= 0)
                return (false, "Failed to update storage status");

            return (true, null);
        }
        catch (JsonException ex)
        {
            return (false, $"Invalid JSON format in storage: {ex.Message}");
        }
        catch (Exception ex)
        {
            return (false, $"Error updating storage status: {ex.Message}");
        }
    }
}