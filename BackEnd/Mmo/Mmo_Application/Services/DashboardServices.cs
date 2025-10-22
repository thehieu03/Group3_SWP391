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
}
