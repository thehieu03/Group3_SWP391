using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Mmo_Application.Services.Interface;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Mmo_Application.Exceptions;
using RabbitMQModel = RabbitMQ.Client.IModel;

namespace Mmo_Application.Services;

public class RabbitMQService : IRabbitMQService, IDisposable
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<RabbitMQService> _logger;
    private IConnection? _connection;
    private RabbitMQModel? _channel;
    private readonly string _orderQueueName = "order_queue";
    private readonly string _paymentQueueName = "payment_queue";
    private readonly IServiceProvider _serviceProvider;

    public RabbitMQService(
        IConfiguration configuration,
        ILogger<RabbitMQService> logger,
        IServiceProvider serviceProvider)
    {
        _configuration = configuration;
        _logger = logger;
        _serviceProvider = serviceProvider;
        InitializeConnection();
    }

    private void InitializeConnection()
    {
        try
        {
            var enabled = _configuration.GetValue<bool>("RabbitMQ:Enabled", false);
            if (!enabled)
            {
                _logger.LogWarning("RabbitMQ is disabled in configuration");
                return;
            }

            var host = _configuration["RabbitMQ:Host"] ?? "localhost";
            var port = _configuration.GetValue<int>("RabbitMQ:Port", 5672);
            var username = _configuration["RabbitMQ:Username"] ?? "guest";
            var password = _configuration["RabbitMQ:Password"] ?? "guest";

            var factory = new ConnectionFactory
            {
                HostName = host,
                Port = port,
                UserName = username,
                Password = password
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel() as RabbitMQModel;

            // Declare queues
            _channel.QueueDeclare(
                queue: _orderQueueName, 
                durable: true, 
                exclusive: false, 
                autoDelete: false, 
                arguments: null);
            _channel.QueueDeclare(
                queue: _paymentQueueName, 
                durable: true, 
                exclusive: false, 
                autoDelete: false, 
                arguments: null);

            _logger.LogInformation("RabbitMQ connection established successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to establish RabbitMQ connection");
        }
    }

    public void PublishToOrderQueue<T>(T message)
    {
        if (_channel == null || _connection == null || !_connection.IsOpen)
        {
            _logger.LogWarning("RabbitMQ connection is not available. Cannot publish to Order Queue.");
            return;
        }

        try
        {
            var json = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(json);

            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true;

            _channel.BasicPublish(
                exchange: "",
                routingKey: _orderQueueName,
                basicProperties: properties,
                body: body);

            _logger.LogInformation("Message published to Order Queue: {Message}", json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing message to Order Queue");
            throw;
        }
    }

    public void PublishToPaymentQueue<T>(T message)
    {
        if (_channel == null || _connection == null || !_connection.IsOpen)
        {
            _logger.LogWarning("RabbitMQ connection is not available. Cannot publish to Payment Queue.");
            return;
        }

        try
        {
            var json = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(json);

            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true;

            _channel.BasicPublish(
                exchange: "",
                routingKey: _paymentQueueName,
                basicProperties: properties,
                body: body);

            _logger.LogInformation("Message published to Payment Queue: {Message}", json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing message to Payment Queue");
            throw;
        }
    }

    public void StartConsumers()
    {
        if (_channel == null || _connection == null || !_connection.IsOpen)
        {
            _logger.LogWarning("RabbitMQ connection is not available. Cannot start consumers.");
            return;
        }

        try
        {
            // Start Order Queue Consumer
            StartOrderQueueConsumer();

            // Start Payment Queue Consumer
            StartPaymentQueueConsumer();

            _logger.LogInformation("RabbitMQ consumers started successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting RabbitMQ consumers");
        }
    }

    private void StartOrderQueueConsumer()
    {
        if (_channel == null) return;

        var consumer = new EventingBasicConsumer(_channel);
        consumer.Received += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            var deliveryTag = ea.DeliveryTag;

            try
            {
                _logger.LogInformation("Order Queue: Received message: {Message}", message);

                using var scope = _serviceProvider.CreateScope();
                var orderServices = scope.ServiceProvider.GetRequiredService<IOrderServices>();

                var orderMessage = JsonSerializer.Deserialize<OrderQueueMessage>(message);
                if (orderMessage != null)
                {
                    await orderServices.ProcessOrderFromQueueAsync(orderMessage);
                }

                _channel.BasicAck(deliveryTag: deliveryTag, multiple: false);
                _logger.LogInformation("Order Queue: Message processed successfully");
            }
            catch (DbUpdateException dbEx)
            {
                var orderMessage = JsonSerializer.Deserialize<OrderQueueMessage>(message);
                _logger.LogError(dbEx, "Order Queue: Database error processing OrderId: {OrderId}, Message: {Message}, Payload: {Payload}", 
                    orderMessage?.OrderId ?? 0, message, JsonSerializer.Serialize(orderMessage));
                
                // Don't requeue - send to Dead Letter Queue
                _channel.BasicNack(deliveryTag: deliveryTag, multiple: false, requeue: false);
            }
            catch (MySqlException mysqlEx)
            {
                var orderMessage = JsonSerializer.Deserialize<OrderQueueMessage>(message);
                _logger.LogError(mysqlEx, "Order Queue: MySQL error processing OrderId: {OrderId}, Message: {Message}, Payload: {Payload}", 
                    orderMessage?.OrderId ?? 0, message, JsonSerializer.Serialize(orderMessage));
                
                // Don't requeue - send to Dead Letter Queue
                _channel.BasicNack(deliveryTag: deliveryTag, multiple: false, requeue: false);
            }
            catch (BusinessException businessEx)
            {
                var orderMessage = JsonSerializer.Deserialize<OrderQueueMessage>(message);
                _logger.LogWarning(businessEx, "Order Queue: Business error (order already marked as Failed) - OrderId: {OrderId}, Message: {Message}", 
                    orderMessage?.OrderId ?? 0, businessEx.Message);
                
                // Business exceptions: order already handled (marked as Failed), acknowledge message
                _channel.BasicAck(deliveryTag: deliveryTag, multiple: false);
            }
            catch (Exception ex)
            {
                var orderMessage = JsonSerializer.Deserialize<OrderQueueMessage>(message);
                _logger.LogError(ex, "Order Queue: Error processing OrderId: {OrderId}, Message: {Message}, Payload: {Payload}", 
                    orderMessage?.OrderId ?? 0, message, JsonSerializer.Serialize(orderMessage));
                
                // For other exceptions, don't requeue to avoid infinite loops
                _channel.BasicNack(deliveryTag: deliveryTag, multiple: false, requeue: false);
            }
        };

        _channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);
        _channel.BasicConsume(queue: _orderQueueName, autoAck: false, consumer: consumer);
    }

    private void StartPaymentQueueConsumer()
    {
        if (_channel == null) return;

        var consumer = new EventingBasicConsumer(_channel);
        consumer.Received += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            var deliveryTag = ea.DeliveryTag;

            try
            {
                _logger.LogInformation("Payment Queue: Received message: {Message}", message);

                using var scope = _serviceProvider.CreateScope();
                var orderServices = scope.ServiceProvider.GetRequiredService<IOrderServices>();
                var paymentServices = scope.ServiceProvider.GetRequiredService<IPaymenttransactionServices>();

                var paymentMessage = JsonSerializer.Deserialize<PaymentQueueMessage>(message);
                if (paymentMessage != null)
                {
                    await orderServices.ProcessPaymentFromQueueAsync(paymentMessage, paymentServices);
                }

                _channel.BasicAck(deliveryTag: deliveryTag, multiple: false);
                _logger.LogInformation("Payment Queue: Message processed successfully");
            }
            catch (DbUpdateException dbEx)
            {
                var paymentMessage = JsonSerializer.Deserialize<PaymentQueueMessage>(message);
                _logger.LogError(dbEx, "Payment Queue: Database error processing OrderId: {OrderId}, Message: {Message}, Payload: {Payload}", 
                    paymentMessage?.OrderId ?? 0, message, JsonSerializer.Serialize(paymentMessage));
                
                // Don't requeue - send to Dead Letter Queue
                _channel.BasicNack(deliveryTag: deliveryTag, multiple: false, requeue: false);
            }
            catch (MySqlException mysqlEx)
            {
                var paymentMessage = JsonSerializer.Deserialize<PaymentQueueMessage>(message);
                _logger.LogError(mysqlEx, "Payment Queue: MySQL error processing OrderId: {OrderId}, Message: {Message}, Payload: {Payload}", 
                    paymentMessage?.OrderId ?? 0, message, JsonSerializer.Serialize(paymentMessage));
                
                // Don't requeue - send to Dead Letter Queue
                _channel.BasicNack(deliveryTag: deliveryTag, multiple: false, requeue: false);
            }
            catch (BusinessException businessEx)
            {
                var paymentMessage = JsonSerializer.Deserialize<PaymentQueueMessage>(message);
                _logger.LogWarning(businessEx, "Payment Queue: Business error (order already marked as Failed) - OrderId: {OrderId}, Message: {Message}", 
                    paymentMessage?.OrderId ?? 0, businessEx.Message);
                
                // Business exceptions: order already handled (marked as Failed), acknowledge message
                _channel.BasicAck(deliveryTag: deliveryTag, multiple: false);
            }
            catch (Exception ex)
            {
                var paymentMessage = JsonSerializer.Deserialize<PaymentQueueMessage>(message);
                _logger.LogError(ex, "Payment Queue: Error processing OrderId: {OrderId}, Message: {Message}, Payload: {Payload}", 
                    paymentMessage?.OrderId ?? 0, message, JsonSerializer.Serialize(paymentMessage));
                
                // For other exceptions, don't requeue to avoid infinite loops
                _channel.BasicNack(deliveryTag: deliveryTag, multiple: false, requeue: false);
            }
        };

        _channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);
        _channel.BasicConsume(queue: _paymentQueueName, autoAck: false, consumer: consumer);
    }

    public void StopConsumers()
    {
        _channel?.Close();
        _connection?.Close();
        _logger.LogInformation("RabbitMQ consumers stopped");
    }

    public void Dispose()
    {
        StopConsumers();
        _channel?.Dispose();
        _connection?.Dispose();
    }
}

// Message models for queues
public class OrderQueueMessage
{
    public int OrderId { get; set; }
    public int AccountId { get; set; }
    public int ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
}

public class PaymentQueueMessage
{
    public int OrderId { get; set; }
    public int AccountId { get; set; }
    public decimal Amount { get; set; }
}

