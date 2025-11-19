namespace Mmo_Application.Services.Interface;

public interface IPaymentPollingService
{
    Task StartAsync(CancellationToken cancellationToken);
    Task StopAsync(CancellationToken cancellationToken);
}

