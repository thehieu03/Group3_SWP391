namespace Mmo_Application.Services.Interface;

public interface IEmailService
{
    Task<bool> SendPasswordResetEmailAsync(string toEmail, string newPassword);
}

