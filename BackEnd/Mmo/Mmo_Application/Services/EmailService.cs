using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Mmo_Application.Services.Interface;

namespace Mmo_Application.Services;

public class EmailService : IEmailService
{
    private readonly ISystemsconfigServices _systemsconfigServices;
    private readonly ILogger<EmailService> _logger;
    private const string SmtpServer = "smtp.gmail.com";
    private const int SmtpPort = 587;

    public EmailService(ISystemsconfigServices systemsconfigServices, ILogger<EmailService> logger)
    {
        _systemsconfigServices = systemsconfigServices;
        _logger = logger;
    }

    public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string newPassword)
    {
        try
        {
            // Get email config from database
            var configs = await _systemsconfigServices.GetAllAsync();
            var config = configs.FirstOrDefault();
            
            if (config == null || string.IsNullOrEmpty(config.Email) || string.IsNullOrEmpty(config.GoogleAppPassword))
            {
                throw new Exception("Email configuration not found");
            }

            var fromEmail = config.Email;
            var appPassword = config.GoogleAppPassword;

            // Create mail message
            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, "MMO Marketplace"),
                Subject = "Khôi phục mật khẩu - MMO Marketplace",
                Body = $@"
Xin chào,

Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản của mình.

Mật khẩu mới của bạn là: <strong>{newPassword}</strong>

Vui lòng đăng nhập với mật khẩu mới này và đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản.

Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Đội ngũ MMO Marketplace
",
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            // Configure SMTP client
            var smtpClient = new SmtpClient(SmtpServer, SmtpPort)
            {
                Credentials = new NetworkCredential(fromEmail, appPassword),
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network
            };

            // Send email
            await smtpClient.SendMailAsync(mailMessage);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
            return false;
        }
    }
}

