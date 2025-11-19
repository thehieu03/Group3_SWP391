namespace Mmo_Domain.Enum;

/// <summary>
/// Trạng thái đơn hàng
/// </summary>
public enum OrderStatus : byte
{
    /// <summary>
    /// Đang chờ xử lý (0)
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Đang xử lý (1)
    /// </summary>
    Processing = 1,

    /// <summary>
    /// Đã hoàn thành (2)
    /// </summary>
    Completed = 2,

    /// <summary>
    /// Thất bại (3)
    /// </summary>
    Failed = 3
}

