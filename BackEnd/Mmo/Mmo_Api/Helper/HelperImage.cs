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
}