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

    public async Task<PaymentHistorySummary> GetPaymentHistoryByUserIdAsync(int userId, DateTime? startDate = null, DateTime? endDate = null, string? transactionType = null, int page = 1, int pageSize = 5)
    {
        // Get user's current balance
        var account = await _unitOfWork.GenericRepository<Account>().GetByIdAsync(userId);
        var totalBalance = account?.Balance ?? 0;

        // Get pending orders to calculate money on hold
        var pendingOrders = await _unitOfWork.GenericRepository<Order>().GetQuery()
            .Where(o => o.AccountId == userId && o.Status == "PENDING")
            .ToListAsync();
        
        // Get pending payment transactions to calculate money on hold
        var pendingTransactions = await _unitOfWork.GenericRepository<Paymenttransaction>().GetQuery()
            .Where(p => p.UserId == userId && p.Status == "PENDING")
            .ToListAsync();
        
        var moneyOnHold = pendingOrders.Sum(o => o.TotalPrice) + pendingTransactions.Sum(p => p.Amount);

        // Get payment transactions for the user with filters
        var transactionsQuery = _unitOfWork.GenericRepository<Paymenttransaction>().GetQuery()
            .Where(p => p.UserId == userId);

        // Apply date filters
        if (startDate.HasValue)
        {
            transactionsQuery = transactionsQuery.Where(p => p.CreatedAt >= startDate.Value);
        }
        if (endDate.HasValue)
        {
            transactionsQuery = transactionsQuery.Where(p => p.CreatedAt <= endDate.Value);
        }

        // Apply transaction type filter
        if (!string.IsNullOrEmpty(transactionType))
        {
            transactionsQuery = transactionsQuery.Where(p => p.Type == transactionType);
        }

        // Get total count for pagination
        var totalCount = await transactionsQuery.CountAsync();
        
        // Calculate pagination
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        var validPage = Math.Max(1, Math.Min(page, totalPages));
        var skip = (validPage - 1) * pageSize;

        var transactions = await transactionsQuery
            .OrderByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();

        var paymentHistoryResponses = transactions.Select(t => new PaymentHistoryResponse
        {
            Id = t.Id,
            UserId = t.UserId ?? 0,
            Type = t.Type,
            Amount = t.Amount,
            PaymentDescription = t.PaymentDescription,
            Status = t.Status ?? "UNKNOWN",
            CreatedAt = t.CreatedAt ?? DateTime.MinValue
        }).ToList();

        // Use existing PaginationResponse
        var paginatedTransactions = new PaginationResponse<PaymentHistoryResponse>
        {
            Data = paymentHistoryResponses,
            CurrentPage = validPage,
            TotalPages = totalPages,
            TotalItems = totalCount,
            ItemsPerPage = pageSize,
            HasNextPage = validPage < totalPages,
            HasPreviousPage = validPage > 1
        };

        return new PaymentHistorySummary
        {
            TotalBalance = totalBalance,
            MoneyOnHold = moneyOnHold,
            Transactions = paginatedTransactions.Data.ToList(),
            CurrentPage = paginatedTransactions.CurrentPage,
            TotalPages = paginatedTransactions.TotalPages,
            TotalItems = paginatedTransactions.TotalItems,
            ItemsPerPage = paginatedTransactions.ItemsPerPage,
            HasNextPage = paginatedTransactions.HasNextPage,
            HasPreviousPage = paginatedTransactions.HasPreviousPage
        };
    }
}
