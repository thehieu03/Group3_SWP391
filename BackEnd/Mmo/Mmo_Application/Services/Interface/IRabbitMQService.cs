namespace Mmo_Application.Services.Interface;

public interface IRabbitMQService
{
    void PublishToOrderQueue<T>(T message);
    void PublishToPaymentQueue<T>(T message);
    void StartConsumers();
    void StopConsumers();
}

