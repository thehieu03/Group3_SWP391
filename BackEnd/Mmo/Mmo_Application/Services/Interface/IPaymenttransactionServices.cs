namespace Mmo_Application.Services.Interface;

public interface IPaymenttransactionServices  :IBaseServices<Paymenttransaction>
{
    Task<bool> ProcessSuccessfulTransactionAsync(int transactionId);
    Task<bool> UpdateAccountBalanceAsync(int userId, decimal amount, string transactionType);
}