using Mmo_Domain.Models;

namespace Mmo_Application.Services;

public class PaymenttransactionServices :BaseServices<Paymenttransaction>, IPaymenttransactionServices
{
    public PaymenttransactionServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> ProcessSuccessfulTransactionAsync(int transactionId)
    {
        var transaction = await GetByIdAsync(transactionId);
        if (transaction == null || transaction.Status != "SUCCESS")
        {
            return false;
        }

        return await UpdateAccountBalanceAsync(transaction.UserId ?? 0, transaction.Amount, transaction.Type);
    }

    public async Task<bool> UpdateAccountBalanceAsync(int userId, decimal amount, string transactionType)
    {
        var account = await _unitOfWork.GenericRepository<Account>().GetByIdAsync(userId);
        if (account == null)
        {
            return false;
        }

        if (account.Balance == null)
        {
            account.Balance = 0;
        }

        switch (transactionType.ToUpper())
        {
            case "WITHDRAWAL":
                account.Balance -= amount; 
                break;
            case "DEPOSIT":
                account.Balance += amount; 
                break;
            case "PURCHASE":
                account.Balance -= amount; 
                break;
            default:
                account.Balance -= amount;
                break;
        }

        account.UpdatedAt = DateTime.Now;
        _unitOfWork.GenericRepository<Account>().Update(account);
        return await _unitOfWork.SaveChangeAsync() > 0;
    }
}