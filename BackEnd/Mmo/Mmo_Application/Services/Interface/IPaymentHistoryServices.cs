using Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services.Interface;

public interface IPaymentHistoryServices
{
    Task<PaymentHistorySummary> GetPaymentHistoryByUserIdAsync(int userId);
}
