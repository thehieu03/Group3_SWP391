using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Mmo_Domain.Enum;

namespace Mmo_Api.Helper;

public static class HelperImage
{
    public static async Task<byte[]> DownloadImageFromUrlAsync(string url)
    {
        try
        {
            using (var client = new HttpClient())
            {
                var imageBytes = await client.GetByteArrayAsync(url);
                return imageBytes;
            }
        }
        catch (Exception ex)
        {
            throw new Exception($"Không thể tải ảnh từ URL: {ex.Message}", ex);
        }
    }

    public static async Task<string> SaveImageByType(ImageCategory category, IFormFile file, IWebHostEnvironment environment,
        long maxBytes = 10 * 1024 * 1024)
    {
        if (file == null || file.Length == 0)
            throw new InvalidOperationException("File is required");

        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("File must be an image");

        if (file.Length > maxBytes)
            throw new InvalidOperationException($"Image size must be ≤ {maxBytes} bytes");

        var folder = category switch
        {
            ImageCategory.Accounts => "Accounts",
            ImageCategory.Products => "Products",
            ImageCategory.Shops => "Shops",
            _ => "Others"
        };

        var uploadsFolder = Path.Combine(environment.ContentRootPath, "Images", folder);
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext)) ext = ".jpg";
        var fileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"/Images/{folder}/{fileName}";
    }

    public static void DeleteImage(string imageUrl)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(imageUrl)) return;

            var basePath = Path.Combine(Directory.GetCurrentDirectory(), "Images");
            var baseUrl = "/Images";

            var relativePath = imageUrl.Replace(baseUrl, string.Empty).TrimStart('/');
            var filePath = Path.Combine(basePath, relativePath);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WARNING] Failed to delete image {imageUrl}: {ex.Message}");
        }
    }
}