using Mmo_Application.Services.Interface;
using Mmo_Domain.IUnit;
using Mmo_Domain.ModelResponse;
using Microsoft.EntityFrameworkCore;

namespace Mmo_Application.Services;

public class DashboardServices : IDashboardServices
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardServices(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardResponse> GetDashboardDataAsync()
    {
        var today = DateTime.Today;
        var startOfToday = today;
        var endOfToday = today.AddDays(1);

        // Thống kê tổng quan
        var totalActiveUsers = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Account>()
            .GetQuery()
            .Where(a => a.IsActive == true)
            .CountAsync();

        var totalActiveShops = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Shop>()
            .GetQuery()
            .Where(s => s.IsActive == true)
            .CountAsync();

        var totalSubcategories = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Subcategory>()
            .GetQuery()
            .Where(sc => sc.IsActive == true)
            .CountAsync();

        var totalTransactions = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Paymenttransaction>()
            .GetQuery()
            .CountAsync();

        var totalPendingSupportTickets = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Supportticket>()
            .GetQuery()
            .CountAsync();

        // Thông báo
        var notifications = new List<NotificationItem>();

        // Thông báo shop đăng ký hôm nay
        var newShopsToday = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Shop>()
            .GetQuery()
            .Where(s => s.CreatedAt >= startOfToday && s.CreatedAt < endOfToday)
            .CountAsync();

        if (newShopsToday > 0)
        {
            notifications.Add(new NotificationItem
            {
                Type = "NewShop",
                Message = $"{newShopsToday} shop mới đã đăng ký hôm nay",
                CreatedAt = DateTime.Now,
                Count = newShopsToday
            });
        }

        // Thông báo giao dịch mới hôm nay
        var newTransactionsToday = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Paymenttransaction>()
            .GetQuery()
            .Where(p => p.CreatedAt >= startOfToday && p.CreatedAt < endOfToday)
            .CountAsync();

        if (newTransactionsToday > 0)
        {
            notifications.Add(new NotificationItem
            {
                Type = "NewTransaction",
                Message = $"{newTransactionsToday} giao dịch mới hôm nay",
                CreatedAt = DateTime.Now,
                Count = newTransactionsToday
            });
        }

        // Thông báo hỗ trợ mới hôm nay
        var newSupportTicketsToday = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Supportticket>()
            .GetQuery()
            .Where(st => st.CreatedAt >= startOfToday && st.CreatedAt < endOfToday)
            .CountAsync();

        if (newSupportTicketsToday > 0)
        {
            notifications.Add(new NotificationItem
            {
                Type = "NewSupportTicket",
                Message = $"{newSupportTicketsToday} yêu cầu hỗ trợ mới hôm nay",
                CreatedAt = DateTime.Now,
                Count = newSupportTicketsToday
            });
        }

        // Thông báo đơn hàng mới hôm nay (sử dụng ID thay vì CreatedAt)
        var newOrdersToday = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Order>()
            .GetQuery()
            .CountAsync();

        if (newOrdersToday > 0)
        {
            notifications.Add(new NotificationItem
            {
                Type = "NewOrder",
                Message = $"Tổng số đơn hàng: {newOrdersToday}",
                CreatedAt = DateTime.Now,
                Count = newOrdersToday
            });
        }

        // Thông báo doanh thu mới hôm nay
        var todayRevenue = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Paymenttransaction>()
            .GetQuery()
            .Where(p => p.CreatedAt >= startOfToday && p.CreatedAt < endOfToday && p.Status == "SUCCESS")
            .SumAsync(p => p.Amount);

        if (todayRevenue > 0)
        {
            notifications.Add(new NotificationItem
            {
                Type = "NewRevenue",
                Message = $"Doanh thu hôm nay: {todayRevenue:N0} VNĐ",
                CreatedAt = DateTime.Now,
                Count = (int)todayRevenue
            });
        }

        return new DashboardResponse
        {
            TotalActiveUsers = totalActiveUsers,
            TotalActiveShops = totalActiveShops,
            TotalSubcategories = totalSubcategories,
            TotalTransactions = totalTransactions,
            TotalPendingSupportTickets = totalPendingSupportTickets,
            Notifications = notifications
        };
    }

    public async Task<SellerDashboardResponse> GetSellerDashboardAsync(int accountId, string? searchTerm = null, string? statusFilter = null, int? categoryFilter = null, int page = 1, int pageSize = 10)
    {
        // seller's shop
        var shop = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Shop>()
            .GetQuery()
            .Where(s => s.AccountId == accountId && s.IsActive == true)
            .FirstOrDefaultAsync();

        if (shop == null)
        {
            return new SellerDashboardResponse
            {
                ShopId = 0,
                ShopName = string.Empty,
                TotalProducts = 0,
                TotalOrders = 0,
                TotalRevenue = 0,
                PendingOrders = 0,
                RecentOrders = new List<SellerRecentOrderItem>()
            };
        }

        var shopId = shop.Id;

        // total products 
        var totalProducts = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Product>()
            .GetQuery()
            .Where(p => p.ShopId == shopId && p.IsActive == true)
            .CountAsync();

        // shop orders query
        var ordersQuery = _unitOfWork.GenericRepository<Mmo_Domain.Models.Order>()
            .GetQuery()
            .Include(o => o.ProductVariant)!
                .ThenInclude(pv => pv.Product!)
                    .ThenInclude(p => p.Category);

        var shopOrdersQuery = ordersQuery
            .Where(o => o.ProductVariant != null && o.ProductVariant.Product != null && o.ProductVariant.Product.ShopId == shopId);

        var totalOrders = await shopOrdersQuery.CountAsync();

        // total revenue (excluding pending orders)
        var totalRevenue = await shopOrdersQuery
            .Where(o => o.Status != null && o.Status != "PENDING")
            .SumAsync(o => (decimal)o.TotalPrice);

        // pending orders (by status)
        var pendingOrders = await shopOrdersQuery
            .Where(o => o.Status != null && o.Status == "PENDING")
            .CountAsync();

        // search
        var recentOrdersQuery = shopOrdersQuery;
        
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            recentOrdersQuery = recentOrdersQuery
                .Where(o => 
                    o.ProductVariant!.Product!.Name != null && o.ProductVariant.Product.Name.Contains(searchTerm)
                );
        }

        // filter by status
        if (!string.IsNullOrWhiteSpace(statusFilter))
        {
            recentOrdersQuery = recentOrdersQuery
                .Where(o => o.Status != null && o.Status == statusFilter);
        }

        // filter by category
        if (categoryFilter.HasValue && categoryFilter.Value > 0)
        {
            recentOrdersQuery = recentOrdersQuery
                .Where(o => o.ProductVariant!.Product!.CategoryId != null && o.ProductVariant.Product.CategoryId == categoryFilter.Value);
        }

        var totalItems = await recentOrdersQuery.CountAsync();

        var validPage = Math.Max(1, page);
        var validPageSize = Math.Max(1, pageSize);
        var totalPages = (int)Math.Ceiling((double)totalItems / validPageSize);

        var recentOrders = await recentOrdersQuery
            .OrderByDescending(o => o.CreatedAt)
            .Skip((validPage - 1) * validPageSize)
            .Take(validPageSize)
            .Select(o => new SellerRecentOrderItem
            {
                OrderId = o.Id,
                CreatedAt = o.CreatedAt,
                ProductName = o.ProductVariant!.Product!.Name,
                VariantName = o.ProductVariant.Name,
                CategoryName = o.ProductVariant.Product.Category != null ? o.ProductVariant.Product.Category.Name : null,
                Quantity = o.Quantity,
                TotalPrice = o.TotalPrice,
                Status = o.Status
            })
            .ToListAsync();

        return new SellerDashboardResponse
        {
            ShopId = shopId,
            ShopName = shop.Name,
            TotalProducts = totalProducts,
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            PendingOrders = pendingOrders,
            RecentOrders = recentOrders,
            CurrentPage = validPage,
            TotalPages = totalPages,
            TotalItems = totalItems,
            ItemsPerPage = validPageSize
        };
    }
}
