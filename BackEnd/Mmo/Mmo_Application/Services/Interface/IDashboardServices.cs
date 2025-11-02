namespace Mmo_Application.Services.Interface;

public interface IDashboardServices
{
    Task<DashboardResponse> GetDashboardDataAsync();
}