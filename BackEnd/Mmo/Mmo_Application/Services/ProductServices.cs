using System;
using Microsoft.EntityFrameworkCore;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services;

public class ProductServices   :BaseServices<Product>, IProductServices
{
    public ProductServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }

    // Approval-related endpoints removed per new business rules (no admin approval)

    public async Task<SellerProductResponse> GetSellerProductsAsync(SellerProductRequest request)
    {
        try
        {
            // Lấy tất cả sản phẩm của shop
            var query = _unitOfWork.GenericRepository<Product>()
                .GetQuery()
                .Include(p => p.Shop!)
                    .ThenInclude(s => s.Account)
                .Include(p => p.Category)
                .Where(p => p.ShopId == request.ShopId);

            // Tìm kiếm theo tên sản phẩm
            if (!string.IsNullOrWhiteSpace(request.SearchProductName))
            {
                var searchTerm = request.SearchProductName.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(searchTerm));
            }

            // Lọc theo category
            if (request.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == request.CategoryId.Value);
            }

            // Lọc theo trạng thái hoạt động
            if (request.IsActive.HasValue)
            {
                query = query.Where(p => p.IsActive == request.IsActive.Value);
            }

            // Đếm tổng số
            var totalCount = await query.CountAsync();

            // Sắp xếp
            query = request.SortBy?.ToLower() switch
            {
                "name" => request.SortDirection?.ToLower() == "asc" 
                    ? query.OrderBy(p => p.Name) 
                    : query.OrderByDescending(p => p.Name),
                "createdat" => request.SortDirection?.ToLower() == "asc" 
                    ? query.OrderBy(p => p.CreatedAt) 
                    : query.OrderByDescending(p => p.CreatedAt),
                "updatedat" => request.SortDirection?.ToLower() == "asc" 
                    ? query.OrderBy(p => p.UpdatedAt) 
                    : query.OrderByDescending(p => p.UpdatedAt),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };

            // Phân trang
            var pageNumber = request.PageNumber > 0 ? request.PageNumber : 1;
            var pageSize = request.PageSize > 0 ? request.PageSize : 10;
            
            var products = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Map sang ProductResponse
            var productResponses = products.Select(p => new ProductResponse
            {
                Id = p.Id,
                ShopId = p.ShopId,
                CategoryId = p.CategoryId,
                Name = p.Name,
                Description = p.Description,
                Image = p.Image,
                Details = p.Details,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                Fee = p.Fee,
                CategoryName = p.Category?.Name,
                ShopName = p.Shop?.Name
            }).ToList();

            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            return new SellerProductResponse
            {
                Products = productResponses,
                TotalCount = totalCount,
                TotalPages = totalPages,
                CurrentPage = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SELLER_PRODUCTS] Error: {ex.Message}");
            throw;
        }
    }
}