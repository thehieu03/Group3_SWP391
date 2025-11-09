using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services.Interface;

public interface IDepositService
{
    Task<DepositResponse> CreateDepositAsync(int userId, CreateDepositRequest request);

    Task<DepositStatusResponse?> GetDepositStatusAsync(int userId, int transactionId);

    Task<VerifyDepositResponse> VerifyDepositAsync(int userId, int transactionId);
}

