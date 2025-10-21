using Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services.Interface;

public interface IOrderServices:IBaseServices<Order>
{
    Task<IEnumerable<OrderResponse>> GetUserOrdersAsync(int accountId);
}