namespace Mmo_Application.Services;

public class TokenServices :BaseServices<Token>,ITokenServices
{
    public TokenServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }
}