using Microsoft.Extensions.Configuration;
using Mmo_Application.Services.Interface;

namespace Mmo_Application.Services;

public class VietQRService : IVietQRService
{
    private readonly IConfiguration _configuration;

    public VietQRService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Generate QR code URL từ VietQR API với format:
    /// {apiUrl}{bankBin}-{accountNo}-{templateId}.jpg?accountName={name}&amount={amount}&addInfo={referenceCode}
    /// 
    /// Khi user quét QR code bằng app ngân hàng:
    /// - Số tài khoản, tên tài khoản, số tiền sẽ được tự động điền
    /// - Reference code sẽ được điền vào phần nội dung chuyển khoản để match sau này
    /// </summary>
    public string GenerateQRCodeUrl(decimal amount, string referenceCode)
    {
        var apiUrl = _configuration["VietQR:ApiUrl"] ?? "https://api.vietqr.io/image/";
        var bankBin = _configuration["VietQR:BankBin"] ?? "970415";
        var accountNo = _configuration["VietQR:AccountNo"] ?? "0868430273";
        var accountName = _configuration["VietQR:AccountName"] ?? "GORNER ROBIN";
        var templateId = _configuration["VietQR:TemplateId"] ?? "U4NCcYH";

        // VietQR yêu cầu amount là số nguyên (không có decimal)
        var amountFormatted = ((long)Math.Round(amount, 0)).ToString();
        var encodedAccountName = Uri.EscapeDataString(accountName);
        // Reference code được encode và đặt trong addInfo để hiển thị trong nội dung chuyển khoản
        var encodedReferenceCode = Uri.EscapeDataString(referenceCode);
        var qrUrl = $"{apiUrl}{bankBin}-{accountNo}-{templateId}.jpg?accountName={encodedAccountName}&amount={amountFormatted}&addInfo={encodedReferenceCode}";
        
        return qrUrl;
    }
}

