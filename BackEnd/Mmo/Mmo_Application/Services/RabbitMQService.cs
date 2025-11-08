using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.Models;
using Mmo_Application.Services.Interface;
using Mmo_Domain.IUnit;

namespace Mmo_Application.Services;

public class RabbitMQService : IRabbitMQService, IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly string _queueName = "product_creation_queue";
    private readonly ILogger<RabbitMQService>? _logger;
    private readonly IServiceProvider _serviceProvider;

    public RabbitMQService(
        ILogger<RabbitMQService>? logger, 
        IServiceProvider serviceProvider,
        IConfiguration configuration)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;

        // RabbitMQ connection configuration từ appsettings.json
        var rabbitMQConfig = configuration.GetSection("RabbitMQ");
        var factory = new ConnectionFactory
        {
            HostName = rabbitMQConfig["Host"] ?? "localhost",
            UserName = rabbitMQConfig["Username"] ?? "guest",
            Password = rabbitMQConfig["Password"] ?? "guest",
            Port = int.TryParse(rabbitMQConfig["Port"], out var port) ? port : 5672
        };

        try
        {
            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();

            // Declare queue with durable = true để đảm bảo messages không bị mất khi server restart
            // exclusive = false để nhiều consumers có thể kết nối
            // autoDelete = false để queue không bị xóa khi không có consumers
            _channel.QueueDeclare(
                queue: _queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );

            // Set QoS để xử lý 1 message tại một thời điểm (sequential processing)
            _channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

            _logger?.LogInformation("RabbitMQ connection established. Queue: {QueueName}", _queueName);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Failed to establish RabbitMQ connection");
            throw;
        }
    }

    public void PublishProductCreationMessage(string message)
    {
        try
        {
            var body = Encoding.UTF8.GetBytes(message);

            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true; // Đảm bảo message không bị mất khi server restart

            _channel.BasicPublish(
                exchange: "",
                routingKey: _queueName,
                basicProperties: properties,
                body: body
            );

            _logger?.LogInformation("Product creation message published to queue: {QueueName}", _queueName);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Failed to publish message to queue: {QueueName}", _queueName);
            throw;
        }
    }

    public void StartConsumingProductCreationQueue()
    {
        var consumer = new EventingBasicConsumer(_channel);

        consumer.Received += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            var deliveryTag = ea.DeliveryTag;

            try
            {
                _logger?.LogInformation("Received product creation message: {Message}", message);

                // Parse message từ JSON
                var productMessage = ProductCreateMessage.FromJson(message);
                if (productMessage == null)
                {
                    _logger?.LogError("Failed to parse product creation message");
                    _channel.BasicNack(deliveryTag: deliveryTag, multiple: false, requeue: false);
                    return;
                }

                // Tạo scope để inject services
                using var scope = _serviceProvider.CreateScope();
                var productServices = scope.ServiceProvider.GetRequiredService<IProductServices>();
                var productVariantServices = scope.ServiceProvider.GetRequiredService<IProductVariantServices>();
                var productStorageServices = scope.ServiceProvider.GetRequiredService<IProductStorageServices>();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                // Bước 1: Tạo Product
                var product = new Product
                {
                    ShopId = productMessage.ShopId,
                    CategoryId = productMessage.CategoryId,
                    SubcategoryId = productMessage.SubcategoryId,
                    Name = productMessage.Name,
                    Description = productMessage.Description,
                    Details = productMessage.Details,
                    ImageUrl = productMessage.ImageUrl,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                if (!string.IsNullOrEmpty(productMessage.ImageUrl))
                {
                    product.ImageUploadedAt = DateTime.UtcNow;
                }

                var productId = await productServices.AddAsync(product);
                if (productId <= 0)
                {
                    _logger?.LogError("Failed to create product: {ProductName}", productMessage.Name);
                    _channel.BasicNack(deliveryTag: deliveryTag, multiple: false, requeue: true);
                    return;
                }

                _logger?.LogInformation("Product created successfully. ProductId: {ProductId}, Name: {ProductName}", 
                    productId, productMessage.Name);

                // Bước 2: Tạo Variants nếu có
                if (productMessage.Variants != null && productMessage.Variants.Any())
                {
                    foreach (var variantMessage in productMessage.Variants)
                    {
                        var variantRequest = new ProductVariantRequest
                        {
                            ProductId = (int)productId,
                            Name = variantMessage.Name,
                            Price = variantMessage.Price,
                            Stock = variantMessage.Stock
                        };

                        var (variantSuccess, variantError, variantId) = await productVariantServices.CreateProductVariantAsync(variantRequest);
                        if (!variantSuccess)
                        {
                            _logger?.LogError("Failed to create variant: {VariantName}. Error: {Error}", 
                                variantMessage.Name, variantError);
                            continue;
                        }

                        _logger?.LogInformation("Variant created successfully. VariantId: {VariantId}, Name: {VariantName}", 
                            variantId, variantMessage.Name);

                        // Bước 3: Tạo Storages cho variant nếu có
                        if (variantMessage.Storages != null && variantMessage.Storages.Any() && variantId.HasValue)
                        {
                            var accounts = new List<AccountStorageItem>();
                            foreach (var storageMessage in variantMessage.Storages)
                            {
                                try
                                {
                                    var jsonDoc = JsonDocument.Parse(storageMessage.Result);
                                    var root = jsonDoc.RootElement;

                                    if (root.TryGetProperty("username", out var usernameProp) &&
                                        root.TryGetProperty("password", out var passwordProp))
                                    {
                                        var account = new AccountStorageItem
                                        {
                                            Username = usernameProp.GetString() ?? "",
                                            Password = passwordProp.GetString() ?? "",
                                            Status = root.TryGetProperty("status", out var statusProp) 
                                                ? statusProp.GetBoolean() 
                                                : false
                                        };

                                        if (!string.IsNullOrWhiteSpace(account.Username) && 
                                            !string.IsNullOrWhiteSpace(account.Password))
                                        {
                                            accounts.Add(account);
                                        }
                                    }
                                }
                                catch (JsonException ex)
                                {
                                    _logger?.LogWarning("Invalid JSON format in storage: {Error}", ex.Message);
                                }
                            }

                            if (accounts.Count > 0)
                            {
                                var storageRequest = new ProductStorageRequest
                                {
                                    ProductVariantId = variantId.Value,
                                    Accounts = accounts
                                };

                                var (storageSuccess, storageError, storageCount) = await productStorageServices.CreateProductStoragesAsync(storageRequest);
                                if (!storageSuccess)
                                {
                                    _logger?.LogError("Failed to create storages for variant {VariantId}. Error: {Error}", 
                                        variantId, storageError);
                                }
                                else
                                {
                                    _logger?.LogInformation("Storages created successfully. VariantId: {VariantId}, Count: {Count}", 
                                        variantId, storageCount);
                                }
                            }
                        }
                    }
                }

                // Acknowledge message sau khi xử lý thành công
                _channel.BasicAck(deliveryTag: deliveryTag, multiple: false);

                _logger?.LogInformation("Product creation message processed successfully. ProductId: {ProductId}", productId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error processing product creation message: {Message}", message);

                // Reject message và requeue để thử lại
                _channel.BasicNack(deliveryTag: deliveryTag, multiple: false, requeue: true);
            }
        };

        _channel.BasicConsume(
            queue: _queueName,
            autoAck: false, // Manual acknowledgment để đảm bảo message được xử lý
            consumer: consumer
        );

        _logger?.LogInformation("Started consuming from queue: {QueueName}", _queueName);
    }

    public void Dispose()
    {
        _channel?.Close();
        _connection?.Close();
        _channel?.Dispose();
        _connection?.Dispose();
    }
}

