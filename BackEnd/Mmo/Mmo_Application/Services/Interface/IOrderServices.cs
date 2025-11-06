using Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services.Interface;

public interface IOrderServices : IBaseServices<Order>
{
    Task<IEnumerable<Order>> GetUserOrdersAsync(int accountId);
    Task<IEnumerable<Order>> AdminGetAllOrderAsync();
    Task<bool> HasFeedbackAsync(int orderId);
}