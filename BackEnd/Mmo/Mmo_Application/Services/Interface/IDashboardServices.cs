using Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services.Interface;

public interface IDashboardServices
{
    Task<DashboardResponse> GetDashboardDataAsync();
    Task<SellerDashboardResponse> GetSellerDashboardAsync(int accountId, string? searchTerm = null, string? statusFilter = null, int? categoryFilter = null, int page = 1, int pageSize = 10);
}
