using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;
using Mmo_Domain.ModelResponse.Mmo_Domain.ModelResponse;

namespace Mmo_Application.Services.Interface
{

    public interface IAccountServices
    {
        Task<Result<AccountRegisterResponse>> RegisterAsync(AccountRegisterRequest request);
        Task<Result<AccountLoginResponse>> LoginAsync(AccountLoginRequest request);
    }
}