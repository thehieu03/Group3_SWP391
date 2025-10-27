using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelResponse;
using Mmo_Domain.Models;
using Mmo_Domain.IUnit;
using Microsoft.EntityFrameworkCore;

namespace Mmo_Application.Services;

public class PaymentHistoryServices : IPaymentHistoryServices
{
    private readonly IUnitOfWork _unitOfWork;

    public PaymentHistoryServices(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PaymentHistorySummary> GetPaymentHistoryByUserIdAsync(int userId)
    {
        // Get user's current balance
        var account = await _unitOfWork.GenericRepository<Account>().GetByIdAsync(userId);
        var totalBalance = account?.Balance ?? 0;

        // Get payment transactions for the user
        var transactions = await _unitOfWork.GenericRepository<Paymenttransaction>().GetQuery()
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var paymentHistoryResponses = transactions.Select(t => new PaymentHistoryResponse
        {
            Id = t.Id,
            UserId = t.UserId ?? 0,
            Type = t.Type,
            Amount = t.Amount,
            PaymentDescription = t.PaymentDescription,
            Status = t.Status,
            CreatedAt = t.CreatedAt ?? DateTime.MinValue
        }).ToList();

        return new PaymentHistorySummary
        {
            TotalBalance = totalBalance,
            Transactions = paymentHistoryResponses
        };
    }
}
