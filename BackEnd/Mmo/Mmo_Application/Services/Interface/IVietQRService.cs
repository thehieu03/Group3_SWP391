namespace Mmo_Application.Services.Interface;

public interface IVietQRService
{
    string GenerateQRCodeUrl(decimal amount, string referenceCode);
}

