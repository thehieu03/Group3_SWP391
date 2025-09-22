namespace Mmo_Application.Services;

public class TextMessageServices :BaseServices<Textmessage>,ITextMessageServices
{
    public TextMessageServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
    }
}