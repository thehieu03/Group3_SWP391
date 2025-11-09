namespace Mmo_Application.Exceptions;

/// <summary>
/// Exception cho lỗi nghiệp vụ - order đã được xử lý (đánh dấu Failed) và không cần retry
/// </summary>
public class BusinessException : Exception
{
    public BusinessException(string message) : base(message)
    {
    }

    public BusinessException(string message, Exception innerException) : base(message, innerException)
    {
    }
}

