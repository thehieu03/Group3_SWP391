using Microsoft.EntityFrameworkCore;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services;

public class ProductServices   :BaseServices<Product>, IProductServices
{
    public ProductServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }

    public async Task<ProductApprovalPagedResponse> GetPendingProductsAsync(ProductApprovalRequest request)
    {
        try
        {
            // Lấy tất cả sản phẩm chưa được duyệt (IsApproved = false hoặc null)
            var query = _unitOfWork.GenericRepository<Product>()
                .GetQuery()
                .Include(p => p.Shop!)
                    .ThenInclude(s => s.Account)
                .Include(p => p.Category)
                .Where(p => p.IsApproved == false || p.IsApproved == null);

            // Tìm kiếm theo tên sản phẩm
            if (!string.IsNullOrWhiteSpace(request.SearchProductName))
            {
                var searchTerm = request.SearchProductName.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(searchTerm));
            }

            // Tìm kiếm theo tên shop
            if (!string.IsNullOrWhiteSpace(request.SearchShopName))
            {
                var searchTerm = request.SearchShopName.ToLower();
                query = query.Where(p => p.Shop != null && p.Shop.Name.ToLower().Contains(searchTerm));
            }

            // Lọc theo category
            if (request.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == request.CategoryId.Value);
            }

            // Sắp xếp
            query = request.SortBy?.ToLower() switch
            {
                "name" => request.SortDirection?.ToLower() == "asc" 
                    ? query.OrderBy(p => p.Name) 
                    : query.OrderByDescending(p => p.Name),
                "createdat" => request.SortDirection?.ToLower() == "asc" 
                    ? query.OrderBy(p => p.CreatedAt) 
                    : query.OrderByDescending(p => p.CreatedAt),
                _ => query.OrderByDescending(p => p.CreatedAt) // Default sort
            };

            // Đếm tổng số
            var totalCount = await query.CountAsync();

            // Phân trang
            var products = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            // Map sang response
            var productResponses = products.Select(p => new ProductApprovalResponse
            {
                Id = p.Id,
                ProductName = p.Name,
                Description = p.Description,
                ShopId = p.ShopId,
                ShopName = p.Shop?.Name ?? "N/A",
                ShopOwnerName = p.Shop?.Account?.Username ?? "N/A",
                Image = p.Image,
                Details = p.Details,
                Fee = p.Fee,
                IsActive = p.IsActive,
                IsApproved = p.IsApproved,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name
            }).ToList();

            var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

            return new ProductApprovalPagedResponse
            {
                Products = productResponses,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalPages = totalPages,
                HasPreviousPage = request.PageNumber > 1,
                HasNextPage = request.PageNumber < totalPages
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT_APPROVAL] Error: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> ApproveProductAsync(int productId)
    {
        try
        {
            var product = await GetByIdAsync(productId);
            if (product == null)
            {
                return false;
            }

            product.IsApproved = true;
            product.UpdatedAt = DateTime.UtcNow;

            return await UpdateAsync(product);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT_APPROVAL] Error approving product: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> RejectProductAsync(int productId)
    {
        try
        {
            var product = await GetByIdAsync(productId);
            if (product == null)
            {
                return false;
            }

            // Có thể xóa hoặc set IsActive = false
            // Ở đây tôi sẽ xóa product
            return await DeleteAsync(product);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PRODUCT_APPROVAL] Error rejecting product: {ex.Message}");
            return false;
        }
    }
}