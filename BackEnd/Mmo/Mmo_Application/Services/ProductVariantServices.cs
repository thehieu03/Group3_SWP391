using Mmo_Domain.ModelRequest;
using Mmo_Domain.Models;

namespace Mmo_Application.Services;

public class ProductVariantServices : BaseServices<Productvariant>, IProductVariantServices
{
    public ProductVariantServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Productvariant>> GetByProductIdAsync(int productId)
    {
        var query = _unitOfWork.GenericRepository<Productvariant>().Get(
            filter: pv => pv.ProductId == productId
        );
        return await Task.FromResult(query.ToList());
    }

    public async Task<(bool Success, string? ErrorMessage, int? VariantId)> CreateProductVariantAsync(ProductVariantRequest request)
    {
        if (request == null)
            return (false, "Request is null", null);

        // Validate ProductId is provided
        if (!request.ProductId.HasValue)
            return (false, "ProductId is required", null);

        // Validate Product exists
        var product = await _unitOfWork.GenericRepository<Product>().GetByIdAsync(request.ProductId.Value);
        if (product == null)
            return (false, $"Product not found with ID: {request.ProductId.Value}", null);

        // Validate variant name is not empty
        if (string.IsNullOrWhiteSpace(request.Name))
            return (false, "Variant name is required", null);

        // Validate price is provided and not negative
        if (!request.Price.HasValue || request.Price.Value < 0)
            return (false, "Price is required and must be greater than or equal to 0", null);

        // Validate stock is not negative if provided
        if (request.Stock.HasValue && request.Stock.Value < 0)
            return (false, "Stock must be greater than or equal to 0", null);

        try
        {
            var variant = new Productvariant
            {
                ProductId = request.ProductId.Value,
                Name = request.Name!,
                Price = request.Price.Value,
                Stock = request.Stock ?? 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.GenericRepository<Productvariant>().AddAsync(variant);
            var saveResult = await _unitOfWork.SaveChangeAsync();

            if (saveResult <= 0)
                return (false, $"Failed to save variant to database. SaveResult: {saveResult}", null);

            // Lấy ID từ entity sau khi đã save (EF Core sẽ set ID tự động)
            var variantId = variant.Id;
            if (variantId <= 0)
                return (false, $"Variant ID is invalid after save. VariantId: {variantId}", null);

            return (true, null, variantId);
        }
        catch (Exception ex)
        {
            return (false, $"Error creating product variant: {ex.Message}. StackTrace: {ex.StackTrace}", null);
        }
    }

    public async Task<(bool Success, string? ErrorMessage)> UpdateProductVariantAsync(int variantId, ProductVariantRequest request)
    {
        if (request == null)
            return (false, "Request is null");

        // Validate variant exists
        var variant = await _unitOfWork.GenericRepository<Productvariant>().GetByIdAsync(variantId);
        if (variant == null)
            return (false, "Product variant not found");

        // Validate Product exists if ProductId is provided
        if (request.ProductId.HasValue)
        {
            var product = await _unitOfWork.GenericRepository<Product>().GetByIdAsync(request.ProductId.Value);
            if (product == null)
                return (false, "Product not found");
        }

        // Update variant name if provided
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            variant.Name = request.Name;
        }

        // Validate and update price if provided
        if (request.Price.HasValue)
        {
            if (request.Price.Value < 0)
                return (false, "Price must be greater than or equal to 0");
            variant.Price = request.Price.Value;
        }

        // Validate and update stock if provided
        if (request.Stock.HasValue)
        {
            if (request.Stock.Value < 0)
                return (false, "Stock must be greater than or equal to 0");
            variant.Stock = request.Stock.Value;
        }

        variant.UpdatedAt = DateTime.UtcNow;

        try
        {
            _unitOfWork.GenericRepository<Productvariant>().Update(variant);
            var saveResult = await _unitOfWork.SaveChangeAsync();

            if (saveResult <= 0)
                return (false, "Failed to update variant in database");

            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, $"Error updating product variant: {ex.Message}");
        }
    }
}