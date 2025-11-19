using Mmo_Domain.Enum;

namespace Mmo_Application.Services.Interface;

public interface IRabbitMQService
{
    void PublishToQueue<T>(T message, QueueType queueType);
    void StartConsumers();
    void StopConsumers();
}

