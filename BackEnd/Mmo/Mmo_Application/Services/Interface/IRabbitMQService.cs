namespace Mmo_Application.Services.Interface;

public interface IRabbitMQService
{
    void PublishProductCreationMessage(string message);
    void StartConsumingProductCreationQueue();
}

