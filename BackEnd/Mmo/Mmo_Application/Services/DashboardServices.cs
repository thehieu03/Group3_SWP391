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

        // Shop đăng ký mới nhất
        var latestShop = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Shop>()
            .GetQuery()
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        if (latestShop != null)
        {
            notifications.Add(new NotificationItem
            {
                Type = "LatestShop",
                Message = $"Shop mới nhất: {latestShop.Name}",
                CreatedAt = latestShop.CreatedAt ?? DateTime.Now,
                Count = 1
            });
        }

        // Giao dịch mới nhất
        var latestTransaction = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Paymenttransaction>()
            .GetQuery()
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        if (latestTransaction != null)
        {
            notifications.Add(new NotificationItem
            {
                Type = "LatestTransaction",
                Message = $"Giao dịch mới nhất: {latestTransaction.Amount:N0} VNĐ",
                CreatedAt = latestTransaction.CreatedAt ?? DateTime.Now,
                Count = 1
            });
        }

        // Ticket hỗ trợ mới nhất
        var latestSupportTicket = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Supportticket>()
            .GetQuery()
            .OrderByDescending(st => st.CreatedAt)
            .FirstOrDefaultAsync();

        if (latestSupportTicket != null)
        {
            notifications.Add(new NotificationItem
            {
                Type = "LatestSupportTicket",
                Message = $"Ticket hỗ trợ mới nhất: {latestSupportTicket.Title}",
                CreatedAt = latestSupportTicket.CreatedAt ?? DateTime.Now,
                Count = 1
            });
        }

        // Đơn hàng mới trong ngày hôm nay
        var newOrdersToday = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Order>()
            .GetQuery()
            .CountAsync();

        notifications.Add(new NotificationItem
        {
            Type = "NewOrder",
            Message = $"Tổng số đơn hàng: {newOrdersToday}",
            CreatedAt = DateTime.Now,
            Count = newOrdersToday
        });

        // Doanh thu hôm nay
        var todayRevenue = await _unitOfWork.GenericRepository<Mmo_Domain.Models.Paymenttransaction>()
            .GetQuery()
            .Where(p => p.CreatedAt >= startOfToday && p.CreatedAt < endOfToday && p.Status == "SUCCESS")
            .SumAsync(p => p.Amount);

        notifications.Add(new NotificationItem
        {
            Type = "TodayRevenue",
            Message = $"Doanh thu hôm nay: {todayRevenue:N0} VNĐ",
            CreatedAt = DateTime.Now,
            Count = (int)todayRevenue
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
