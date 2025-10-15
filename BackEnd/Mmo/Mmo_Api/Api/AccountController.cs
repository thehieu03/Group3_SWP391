using Microsoft.AspNetCore.OData.Query;
using Mmo_Application.Services.Interface;
using Mmo_Domain.ModelResponse;

namespace Mmo_Api.ApiController;

[Route("api/account")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly IAccountServices _accountServices;
    private readonly IMapper _mapper;

    public AccountController(IAccountServices accountServices,IMapper mapper)
    {
        _accountServices = accountServices;
        _mapper = mapper;
    }
    

}