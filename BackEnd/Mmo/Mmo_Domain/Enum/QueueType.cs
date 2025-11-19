namespace Mmo_Domain.Enum;

/// <summary>
/// Enum representing different RabbitMQ queue types
/// </summary>
public enum QueueType
{
    /// <summary>
    /// Order processing queue
    /// </summary>
    OrderQueue,

    /// <summary>
    /// Payment processing queue
    /// </summary>
    PaymentQueue
}

