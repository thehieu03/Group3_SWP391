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
    private IConnection? _connection;
    private IModel? _channel;
    private readonly string _queueName = "product_creation_queue";
    private readonly ILogger<RabbitMQService>? _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private readonly object _lockObject = new object();
    private bool _isConnected = false;

    public RabbitMQService(
        ILogger<RabbitMQService>? logger, 
        IServiceProvider serviceProvider,
        IConfiguration configuration)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _configuration = configuration;
        // Connection will be established lazily when needed
    }

    private bool EnsureConnection()
    {
        // Check if RabbitMQ is disabled in configuration
        var rabbitMQConfig = _configuration.GetSection("RabbitMQ");
        var isEnabled = rabbitMQConfig.GetValue<bool>("Enabled", true);
        if (!isEnabled)
        {
            _logger?.LogDebug("RabbitMQ is disabled in configuration");
            return false;
        }

        if (_isConnected && _connection?.IsOpen == true && _channel?.IsOpen == true)
        {
            return true;
        }

        lock (_lockObject)
        {
            if (_isConnected && _connection?.IsOpen == true && _channel?.IsOpen == true)
            {
                return true;
            }

            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = rabbitMQConfig["Host"] ?? "localhost",
                    UserName = rabbitMQConfig["Username"] ?? "guest",
                    Password = rabbitMQConfig["Password"] ?? "guest",
                    Port = int.TryParse(rabbitMQConfig["Port"], out var port) ? port : 5672,
                    RequestedConnectionTimeout = TimeSpan.FromSeconds(5) // Shorter timeout
                };

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

                _isConnected = true;
                _logger?.LogInformation("RabbitMQ connection established. Queue: {QueueName}", _queueName);
                return true;
            }
            catch (Exception ex)
            {
                // Log as warning instead of error since this is expected when RabbitMQ is unavailable
                _logger?.LogWarning(ex, "RabbitMQ connection unavailable. The application will continue without RabbitMQ support. " +
                    "To disable RabbitMQ entirely, set RabbitMQ:Enabled to false in appsettings.json");
                _isConnected = false;
                _connection?.Dispose();
                _channel?.Dispose();
                _connection = null;
                _channel = null;
                return false;
            }
        }
    }

    public void PublishProductCreationMessage(string message)
    {
        if (!EnsureConnection())
        {
            _logger?.LogWarning("Cannot publish message: RabbitMQ connection is not available");
            return;
        }

        try
        {
            var body = Encoding.UTF8.GetBytes(message);

            var properties = _channel!.CreateBasicProperties();
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
            _isConnected = false;
            // Don't throw - allow application to continue
        }
    }

    public void StartConsumingProductCreationQueue()
    {
        if (!EnsureConnection())
        {
            _logger?.LogWarning("Cannot start consuming: RabbitMQ connection is not available");
            return;
        }

        var consumer = new EventingBasicConsumer(_channel!);

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
                    if (_channel?.IsOpen == true)
                    {
                        _channel.BasicNack(deliveryTag: deliveryTag, multiple: false, requeue: false);
                    }
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
                    if (_channel?.IsOpen == true)
                    {
                        _channel.BasicNack(deliveryTag: deliveryTag, multiple: false, requeue: true);
                    }
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
                if (_channel?.IsOpen == true)
                {
                    _channel.BasicAck(deliveryTag: deliveryTag, multiple: false);
                }

                _logger?.LogInformation("Product creation message processed successfully. ProductId: {ProductId}", productId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error processing product creation message: {Message}", message);

                // Reject message và requeue để thử lại
                if (_channel?.IsOpen == true)
                {
                    try
                    {
                        _channel.BasicNack(deliveryTag: deliveryTag, multiple: false, requeue: true);
                    }
                    catch (Exception ackEx)
                    {
                        _logger?.LogError(ackEx, "Failed to nack message");
                    }
                }
            }
        };

        if (_channel?.IsOpen == true)
        {
            _channel.BasicConsume(
                queue: _queueName,
                autoAck: false, // Manual acknowledgment để đảm bảo message được xử lý
                consumer: consumer
            );

            _logger?.LogInformation("Started consuming from queue: {QueueName}", _queueName);
        }
    }

    public void Dispose()
    {
        lock (_lockObject)
        {
            try
            {
                _channel?.Close();
                _connection?.Close();
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Error closing RabbitMQ connection during dispose");
            }
            finally
            {
                _channel?.Dispose();
                _connection?.Dispose();
                _isConnected = false;
            }
        }
    }
}

