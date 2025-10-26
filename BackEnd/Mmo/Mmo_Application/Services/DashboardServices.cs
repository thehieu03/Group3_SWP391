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
            .Where(o => o.CreatedAt >= startOfToday && o.CreatedAt < endOfToday && o.Status == "CONFIRMED")
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
}
