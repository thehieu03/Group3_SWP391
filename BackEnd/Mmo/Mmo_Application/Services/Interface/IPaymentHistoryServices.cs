using Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services.Interface;

public interface IPaymentHistoryServices
{
    Task<PaymentHistorySummary> GetPaymentHistoryByUserIdAsync(int userId, DateTime? startDate = null, DateTime? endDate = null, string? transactionType = null, int page = 1, int pageSize = 5);
}
