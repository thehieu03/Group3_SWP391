using Mmo_Domain.Enum;

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
        var totalActiveUsers = await _unitOfWork.GenericRepository<Account>()
            .GetQuery()
            .Where(a => a.IsActive == true)
            .CountAsync();

        var totalActiveShops = await _unitOfWork.GenericRepository<Shop>()
            .GetQuery()
            .Where(s => s.Status == "APPROVED")
            .CountAsync();

        var totalSubcategories = await _unitOfWork.GenericRepository<Subcategory>()
            .GetQuery()
            .Where(sc => sc.IsActive == true)
            .CountAsync();

        var totalTransactions = await _unitOfWork.GenericRepository<Paymenttransaction>()
            .GetQuery()
            .CountAsync();

        var totalPendingSupportTickets = await _unitOfWork.GenericRepository<Supportticket>()
            .GetQuery()
            .CountAsync();

        var notifications = new List<NotificationItem>();

        var latestShop = await _unitOfWork.GenericRepository<Shop>()
            .GetQuery()
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        if (latestShop != null)
            notifications.Add(new NotificationItem
            {
                Type = "LatestShop",
                Message = $"Shop mới nhất: {latestShop.Name}",
                CreatedAt = latestShop.CreatedAt ?? DateTime.Now,
                Count = 1
            });

        var latestTransaction = await _unitOfWork.GenericRepository<Paymenttransaction>()
            .GetQuery()
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        if (latestTransaction != null)
            notifications.Add(new NotificationItem
            {
                Type = "LatestTransaction",
                Message = $"Giao dịch mới nhất: {latestTransaction.Amount:N0} VNĐ",
                CreatedAt = latestTransaction.CreatedAt ?? DateTime.Now,
                Count = 1
            });

        var latestSupportTicket = await _unitOfWork.GenericRepository<Supportticket>()
            .GetQuery()
            .OrderByDescending(st => st.CreatedAt)
            .FirstOrDefaultAsync();

        if (latestSupportTicket != null)
            notifications.Add(new NotificationItem
            {
                Type = "LatestSupportTicket",
                Message = $"Ticket hỗ trợ mới nhất: {latestSupportTicket.Title}",
                CreatedAt = latestSupportTicket.CreatedAt ?? DateTime.Now,
                Count = 1
            });

        var newOrdersToday = await _unitOfWork.GenericRepository<Order>()
            .GetQuery()
            .Where(o => o.CreatedAt >= startOfToday && o.CreatedAt < endOfToday && o.Status == OrderStatus.Completed)
            .CountAsync();

        notifications.Add(new NotificationItem
        {
            Type = "NewOrder",
            Message = $"Đơn hàng thành công hôm nay: {newOrdersToday}",
            CreatedAt = DateTime.Now,
            Count = newOrdersToday
        });

        var todayRevenue = await _unitOfWork.GenericRepository<Paymenttransaction>()
            .GetQuery()
            .Where(p => p.CreatedAt >= startOfToday && p.CreatedAt < endOfToday && p.Status == "SUCCESS")
            .SumAsync(p => p.Amount);

        var successfulTransactionsToday = await _unitOfWork.GenericRepository<Paymenttransaction>()
            .GetQuery()
            .Where(p => p.CreatedAt >= startOfToday && p.CreatedAt < endOfToday && p.Status == "SUCCESS")
            .CountAsync();

        notifications.Add(new NotificationItem
        {
            Type = "TodayRevenue",
            Message = $"Doanh thu hôm nay: {todayRevenue:N0} VNĐ",
            CreatedAt = DateTime.Now,
            Count = (int)todayRevenue
        });

        notifications.Add(new NotificationItem
        {
            Type = "SuccessfulTransactions",
            Message = $"Giao dịch thành công hôm nay: {successfulTransactionsToday}",
            CreatedAt = DateTime.Now,
            Count = successfulTransactionsToday
        });

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

    public async Task<SellerDashboardResponse> GetSellerDashboardAsync(int accountId, string? searchTerm = null, string? statusFilter = null,
        int? categoryFilter = null, int page = 1, int pageSize = 10)
    {
        // Find seller's shop (only APPROVED shops can access dashboard)
        var shop = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Shop>()
            .GetQuery()
            .Where(s => s.AccountId == accountId && s.Status == "APPROVED")
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
             .Where(o => o.Status != OrderStatus.Pending || o.Status != OrderStatus.Failed)
             .SumAsync(o => (decimal)o.TotalPrice);
    
         // pending orders (by status)
         var pendingOrders = await shopOrdersQuery
             .Where(o => o.Status == OrderStatus.Pending)
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
             if (Enum.TryParse<OrderStatus>(statusFilter, true, out var statusEnum))
             {
                 recentOrdersQuery = recentOrdersQuery
                     .Where(o => o.Status == statusEnum);
             }
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
                 Status = o.Status.ToString()
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
         };    }

    // public async Task<SellerDashboardResponse> GetSellerDashboardAsync(int accountId, string? searchTerm = null, string? statusFilter = null, int? categoryFilter = null, int page = 1, int pageSize = 10)
    // {
    //     // seller's shop
    //     var shop = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Shop>()
    //         .GetQuery()
    //         .Where(s => s.AccountId == accountId && s.IsActive == true)
    //         .FirstOrDefaultAsync();
    //
    //     if (shop == null)
    //     {
    //         return new SellerDashboardResponse
    //         {
    //             ShopId = 0,
    //             ShopName = string.Empty,
    //             TotalProducts = 0,
    //             TotalOrders = 0,
    //             TotalRevenue = 0,
    //             PendingOrders = 0,
    //             RecentOrders = new List<SellerRecentOrderItem>()
    //         };
    //     }
    //
    //     var shopId = shop.Id;
    //
    //     // total products 
    //     var totalProducts = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Product>()
    //         .GetQuery()
    //         .Where(p => p.ShopId == shopId && p.IsActive == true)
    //         .CountAsync();
    //
    //     // shop orders query
    //     var ordersQuery = _unitOfWork.GenericRepository<Mmo_Domain.Models.Order>()
    //         .GetQuery()
    //         .Include(o => o.ProductVariant)!
    //             .ThenInclude(pv => pv.Product!)
    //                 .ThenInclude(p => p.Category);
    //
    //     var shopOrdersQuery = ordersQuery
    //         .Where(o => o.ProductVariant != null && o.ProductVariant.Product != null && o.ProductVariant.Product.ShopId == shopId);
    //
    //     var totalOrders = await shopOrdersQuery.CountAsync();
    //
    //     // total revenue (excluding pending orders)
    //     var totalRevenue = await shopOrdersQuery
    //         .Where(o => o.Status != null && o.Status != "PENDING")
    //         .SumAsync(o => (decimal)o.TotalPrice);
    //
    //     // pending orders (by status)
    //     var pendingOrders = await shopOrdersQuery
    //         .Where(o => o.Status != null && o.Status == "PENDING")
    //         .CountAsync();
    //
    //     // search
    //     var recentOrdersQuery = shopOrdersQuery;
    //     
    //     if (!string.IsNullOrWhiteSpace(searchTerm))
    //     {
    //         recentOrdersQuery = recentOrdersQuery
    //             .Where(o => 
    //                 o.ProductVariant!.Product!.Name != null && o.ProductVariant.Product.Name.Contains(searchTerm)
    //             );
    //     }
    //
    //     // filter by status
    //     if (!string.IsNullOrWhiteSpace(statusFilter))
    //     {
    //         recentOrdersQuery = recentOrdersQuery
    //             .Where(o => o.Status != null && o.Status == statusFilter);
    //     }
    //
    //     // filter by category
    //     if (categoryFilter.HasValue && categoryFilter.Value > 0)
    //     {
    //         recentOrdersQuery = recentOrdersQuery
    //             .Where(o => o.ProductVariant!.Product!.CategoryId != null && o.ProductVariant.Product.CategoryId == categoryFilter.Value);
    //     }
    //
    //     var totalItems = await recentOrdersQuery.CountAsync();
    //
    //     var validPage = Math.Max(1, page);
    //     var validPageSize = Math.Max(1, pageSize);
    //     var totalPages = (int)Math.Ceiling((double)totalItems / validPageSize);
    //
    //     var recentOrders = await recentOrdersQuery
    //         .OrderByDescending(o => o.CreatedAt)
    //         .Skip((validPage - 1) * validPageSize)
    //         .Take(validPageSize)
    //         .Select(o => new SellerRecentOrderItem
    //         {
    //             OrderId = o.Id,
    //             CreatedAt = o.CreatedAt,
    //             ProductName = o.ProductVariant!.Product!.Name,
    //             VariantName = o.ProductVariant.Name,
    //             CategoryName = o.ProductVariant.Product.Category != null ? o.ProductVariant.Product.Category.Name : null,
    //             Quantity = o.Quantity,
    //             TotalPrice = o.TotalPrice,
    //             Status = o.Status
    //         })
    //         .ToListAsync();
    //
    //     return new SellerDashboardResponse
    //     {
    //         ShopId = shopId,
    //         ShopName = shop.Name,
    //         TotalProducts = totalProducts,
    //         TotalOrders = totalOrders,
    //         TotalRevenue = totalRevenue,
    //         PendingOrders = pendingOrders,
    //         RecentOrders = recentOrders,
    //         CurrentPage = validPage,
    //         TotalPages = totalPages,
    //         TotalItems = totalItems,
    //         ItemsPerPage = validPageSize
    //     };
    // }
    
    
}
