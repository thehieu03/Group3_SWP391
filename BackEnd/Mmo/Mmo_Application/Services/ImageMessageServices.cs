namespace Mmo_Application.Services;

public class ImageMessageServices : BaseServices<Imagemessage>, IImageMessageServices
{
    public ImageMessageServices(IUnitOfWork unitOfWork) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
}