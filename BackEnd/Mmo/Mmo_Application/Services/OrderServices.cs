using System.Text.Json;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;
using Mmo_Application.Services.Interface;
using Mmo_Domain.Enum;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Mmo_Application.Exceptions;

namespace Mmo_Application.Services;

public class OrderServices : BaseServices<Order>, IOrderServices
{
    private readonly IRabbitMQService? _rabbitMQService;
    private readonly ILogger<OrderServices>? _logger;

    public OrderServices(IUnitOfWork unitOfWork, IRabbitMQService? rabbitMQService = null, ILogger<OrderServices>? logger = null) : base(unitOfWork)
    {
        _unitOfWork = unitOfWork;
        _rabbitMQService = rabbitMQService;
        _logger = logger;
    }

    public async Task<IEnumerable<Order>> GetUserOrdersAsync(int accountId)
    {
        var orders = await _unitOfWork.GenericRepository<Order>()
            .Get(
                o => o.AccountId == accountId,
                includeProperties:
                "ProductVariant.Product.Shop.Account,ProductVariant.Product.Category,ProductVariant.Product.Subcategory"
            ).ToListAsync();
        return orders;
    }

    public async Task<IEnumerable<Order>> AdminGetAllOrderAsync()
    {
        var orders = await _unitOfWork.GenericRepository<Order>()
            .Get(
                includeProperties:
                "Account,ProductVariant.Product.Shop.Account,ProductVariant.Product.Category,ProductVariant.Product.Subcategory"
            ).ToListAsync();
        return orders;
    }

    public async Task<IEnumerable<Order>> GetShopOrdersAsync(int shopId)
    {
        // Lấy tất cả products của shop
        var products = await _unitOfWork.GenericRepository<Product>()
            .Get(p => p.ShopId == shopId)
            .Select(p => p.Id)
            .ToListAsync();

        if (!products.Any())
            return new List<Order>();

        // Lấy tất cả product variants của các products đó
        var productVariants = await _unitOfWork.GenericRepository<Productvariant>()
            .Get(pv => products.Contains(pv.ProductId ?? 0))
            .Select(pv => pv.Id)
            .ToListAsync();

        if (!productVariants.Any())
            return new List<Order>();

        // Lấy tất cả orders của các product variants đó
        var orders = await _unitOfWork.GenericRepository<Order>()
            .Get(
                o => productVariants.Contains(o.ProductVariantId ?? 0),
                includeProperties:
                "Account,ProductVariant.Product.Shop.Account,ProductVariant.Product.Category,ProductVariant.Product.Subcategory"
            ).ToListAsync();

        return orders;
    }

    public async Task<Order?> GetOrderByIdAsync(int orderId)
    {
        try
        {
            var order = await _unitOfWork.GenericRepository<Order>()
                .Get(
                    filter: o => o.Id == orderId,
                    includeProperties: "Account,ProductVariant,ProductVariant.Product,ProductVariant.Product.Shop,ProductVariant.Product.Shop.Account"
                )
                .FirstOrDefaultAsync();

            return order;
        }
        catch
        {
            // Fallback: try without includes
            return await _unitOfWork.GenericRepository<Order>()
                .GetByIdAsync(orderId);
        }
    }

    public async Task<bool> HasFeedbackAsync(int orderId)
    {
        var feedback = await _unitOfWork.GenericRepository<Feedback>()
            .Get(f => f.OrderId == orderId)
            .FirstOrDefaultAsync();

        return feedback != null;
    }

    public async Task<(bool Success, string? ErrorMessage, Order? Order)> CreateOrderAsync(int accountId, CreateOrderRequest request)
    {
        try
        {
            // Validate request
            if (request == null)
                return (false, "Request cannot be null", null);

            if (request.Quantity <= 0)
                return (false, "Quantity must be greater than 0", null);

            // Get ProductVariant
            var variant = await _unitOfWork.GenericRepository<Productvariant>()
                .Get(
                    filter: pv => pv.Id == request.ProductVariantId,
                    includeProperties: "Product"
                )
                .FirstOrDefaultAsync();

            if (variant == null)
                return (false, "Product variant not found", null);

            if (variant.Product == null)
                return (false, "Product not found for this variant", null);

            // Calculate total price
            var unitPrice = variant.Price;
            var totalPrice = unitPrice * request.Quantity;

            // Create Order with Pending status (will be processed by queue)
            var order = new Order
            {
                AccountId = accountId,
                ProductVariantId = request.ProductVariantId,
                Quantity = request.Quantity,
                TotalPrice = totalPrice,
                Payload = null, // Will be set when processing from queue
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.GenericRepository<Order>().AddAsync(order);

            // Log before saving
            _logger?.LogInformation("Creating order with OrderId: {OrderId}, Status: {Status}", order.Id, order.Status);

            // Save changes to get Order ID
            var saveResult = await _unitOfWork.SaveChangeAsync();
            if (saveResult <= 0)
                return (false, "Failed to save order", null);

            // Reload order with related entities
            var createdOrder = await GetOrderByIdAsync(order.Id);
            return (true, null, createdOrder);
        }
        catch (Exception ex)
        {
            return (false, $"Error creating order: {ex.Message}", null);
        }
    }

    public async Task ProcessOrderFromQueueAsync(OrderQueueMessage message)
    {
        try
        {
            // Get order
            var order = await GetOrderByIdAsync(message.OrderId);
            if (order == null)
            {
                throw new Exception($"Order {message.OrderId} not found");
            }

            // Get ProductVariant
            var variant = await _unitOfWork.GenericRepository<Productvariant>()
                .Get(
                    filter: pv => pv.Id == message.ProductVariantId,
                    includeProperties: "Product"
                )
                .FirstOrDefaultAsync();

            if (variant == null)
            {
                order.Status = OrderStatus.Failed;
                order.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.GenericRepository<Order>().Update(order);
                _logger?.LogWarning("Order {OrderId}: Product variant {ProductVariantId} not found. Setting status to Failed.", message.OrderId, message.ProductVariantId);
                await _unitOfWork.SaveChangeAsync();
                throw new BusinessException($"Product variant {message.ProductVariantId} not found");
            }

            // Check stock
            if (variant.Stock == null || variant.Stock < message.Quantity)
            {
                order.Status = OrderStatus.Failed;
                order.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.GenericRepository<Order>().Update(order);
                _logger?.LogWarning("Order {OrderId}: Insufficient stock. Available: {Available}, Requested: {Requested}. Setting status to Failed.", 
                    message.OrderId, variant.Stock ?? 0, message.Quantity);
                await _unitOfWork.SaveChangeAsync();
                throw new BusinessException($"Insufficient stock. Available: {variant.Stock ?? 0}, Requested: {message.Quantity}");
            }

            // Get available ProductStorages (status = false means not sold)
            var allStorages = await _unitOfWork.GenericRepository<Productstorage>()
                .Get(
                    filter: ps => ps.ProductVariantId == message.ProductVariantId,
                    orderBy: q => q.OrderBy(ps => ps.Id)
                )
                .ToListAsync();

            _logger?.LogInformation("Order {OrderId}: Found {TotalStorages} ProductStorages for ProductVariant {ProductVariantId}", 
                message.OrderId, allStorages.Count, message.ProductVariantId);

            // Filter storages with status = false in Result JSON (false = chưa bán, true = đã bán)
            // Nếu không có status trong JSON, mặc định là false (chưa bán)
            var availableStorages = new List<Productstorage>();
            int soldCount = 0;
            int invalidJsonCount = 0;
            
            foreach (var storage in allStorages)
            {
                try
                {
                    var accountData = JsonSerializer.Deserialize<Dictionary<string, object>>(storage.Result ?? "{}");
                    if (accountData != null)
                    {
                        bool isSold = false;
                        if (accountData.TryGetValue("status", out var statusObj))
                        {
                            var statusValue = statusObj?.ToString();
                            if (bool.TryParse(statusValue, out var status))
                            {
                                isSold = status; // true = đã bán, false = chưa bán
                            }
                        }
                        
                        if (isSold)
                        {
                            soldCount++;
                        }
                        else
                        {
                            // Nếu không có status hoặc status = false (chưa bán), thì có thể bán
                            availableStorages.Add(storage);
                            if (availableStorages.Count >= message.Quantity)
                                break;
                        }
                    }
                }
                catch
                {
                    invalidJsonCount++;
                    // Skip invalid JSON
                }
            }

            _logger?.LogInformation("Order {OrderId}: ProductStorage breakdown - Total: {Total}, Available: {Available}, Sold: {Sold}, Invalid JSON: {Invalid}", 
                message.OrderId, allStorages.Count, availableStorages.Count, soldCount, invalidJsonCount);

            if (availableStorages.Count < message.Quantity)
            {
                order.Status = OrderStatus.Failed;
                order.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.GenericRepository<Order>().Update(order);
                _logger?.LogWarning("Order {OrderId}: Insufficient available accounts. Available: {Available}, Requested: {Requested}, Total Storages: {Total}, Sold: {Sold}. Setting status to Failed.", 
                    message.OrderId, availableStorages.Count, message.Quantity, allStorages.Count, soldCount);
                await _unitOfWork.SaveChangeAsync();
                throw new BusinessException($"Insufficient available accounts. Available: {availableStorages.Count}, Requested: {message.Quantity}");
            }

            // Create payload from ProductStorages (include storage IDs for later update)
            var payloadAccounts = availableStorages.Select(ps =>
            {
                try
                {
                    var accountData = JsonSerializer.Deserialize<Dictionary<string, object>>(ps.Result ?? "{}");
                    return new
                    {
                        storageId = ps.Id, // Store ProductStorage ID for later update
                        username = accountData?.GetValueOrDefault("username")?.ToString() ?? "",
                        password = accountData?.GetValueOrDefault("password")?.ToString() ?? ""
                    };
                }
                catch
                {
                    return new { storageId = ps.Id, username = "", password = "" };
                }
            }).ToList();

            var payload = JsonSerializer.Serialize(payloadAccounts);

            // Update order payload
            order.Payload = payload;
            order.Status = OrderStatus.Processing;
            order.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.GenericRepository<Order>().Update(order);
            _logger?.LogInformation("Order {OrderId}: Updated payload and set status to Processing", message.OrderId);

            // Note: Stock and ProductStorage will be updated in ProcessPaymentFromQueueAsync
            // after payment is confirmed to avoid deducting stock if payment fails

            // Log before saving
            _logger?.LogInformation("Order {OrderId}: Saving changes with Status: {Status}", message.OrderId, order.Status);

            // Save changes
            await _unitOfWork.SaveChangeAsync();

            // Publish to Payment Queue
            var paymentMessage = new PaymentQueueMessage
            {
                OrderId = message.OrderId,
                AccountId = message.AccountId,
                Amount = message.TotalPrice
            };

            _rabbitMQService?.PublishToPaymentQueue(paymentMessage);
        }
        catch (Exception ex)
        {
            throw new Exception($"Error processing order from queue: {ex.Message}", ex);
        }
    }

    public async Task ProcessPaymentFromQueueAsync(PaymentQueueMessage message, IPaymenttransactionServices paymentServices)
    {
        try
        {
            // Get order with related entities
            var order = await GetOrderByIdAsync(message.OrderId);
            if (order == null)
            {
                throw new Exception($"Order {message.OrderId} not found");
            }

            // Get Product to access Fee
            if (order.ProductVariant?.Product == null)
            {
                order.Status = OrderStatus.Failed;
                order.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.GenericRepository<Order>().Update(order);
                _logger?.LogWarning("Order {OrderId}: Product not found. Setting status to Failed.", message.OrderId);
                await _unitOfWork.SaveChangeAsync();
                throw new BusinessException($"Product not found for order {message.OrderId}");
            }

            var product = order.ProductVariant.Product;

            // Check buyer account balance
            var buyerAccount = await _unitOfWork.GenericRepository<Account>().GetByIdAsync(message.AccountId);
            if (buyerAccount == null)
            {
                order.Status = OrderStatus.Failed;
                order.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.GenericRepository<Order>().Update(order);
                _logger?.LogWarning("Order {OrderId}: Account {AccountId} not found. Setting status to Failed.", message.OrderId, message.AccountId);
                await _unitOfWork.SaveChangeAsync();
                throw new BusinessException($"Account {message.AccountId} not found");
            }

            if (buyerAccount.Balance == null)
                buyerAccount.Balance = 0;

            if (buyerAccount.Balance < message.Amount)
            {
                order.Status = OrderStatus.Failed;
                order.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.GenericRepository<Order>().Update(order);
                _logger?.LogWarning("Order {OrderId}: Insufficient balance. Available: {Available}, Required: {Required}. Setting status to Failed.", 
                    message.OrderId, buyerAccount.Balance, message.Amount);
                await _unitOfWork.SaveChangeAsync();
                throw new BusinessException($"Insufficient balance. Available: {buyerAccount.Balance}, Required: {message.Amount}");
            }

            // Calculate fee (Fee is percentage, e.g., 0.05 = 5%)
            var feePercentage = product.Fee ?? 0;
            var feeAmount = message.Amount * feePercentage;
            var sellerAmount = message.Amount - feeAmount;

            // Deduct balance from buyer
            buyerAccount.Balance -= message.Amount;
            buyerAccount.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.GenericRepository<Account>().Update(buyerAccount);
            _logger?.LogInformation("Order {OrderId}: Deducted {Amount} from buyer account {AccountId}", 
                message.OrderId, message.Amount, message.AccountId);

            // Find admin account (account with Admin role)
            var adminRole = await _unitOfWork.GenericRepository<Role>()
                .Get(r => r.RoleName == "Admin")
                .FirstOrDefaultAsync();

            if (adminRole != null)
            {
                var adminAccountRole = await _unitOfWork.GenericRepository<Accountrole>()
                    .Get(ar => ar.RoleId == adminRole.Id)
                    .FirstOrDefaultAsync();

                if (adminAccountRole?.AccountId != null)
                {
                    var adminAccount = await _unitOfWork.GenericRepository<Account>()
                        .GetByIdAsync(adminAccountRole.AccountId.Value);

                    if (adminAccount != null)
                    {
                        if (adminAccount.Balance == null)
                            adminAccount.Balance = 0;

                        // Add fee to admin account
                        adminAccount.Balance += feeAmount;
                        adminAccount.UpdatedAt = DateTime.UtcNow;
                        _unitOfWork.GenericRepository<Account>().Update(adminAccount);
                        _logger?.LogInformation("Order {OrderId}: Added fee {FeeAmount} to admin account {AdminAccountId} (Fee: {FeePercentage}%)", 
                            message.OrderId, feeAmount, adminAccount.Id, feePercentage * 100);
                    }
                    else
                    {
                        _logger?.LogWarning("Order {OrderId}: Admin account {AccountId} not found. Fee {FeeAmount} not distributed.", 
                            message.OrderId, adminAccountRole.AccountId, feeAmount);
                    }
                }
                else
                {
                    _logger?.LogWarning("Order {OrderId}: Admin account role not found. Fee {FeeAmount} not distributed.", 
                        message.OrderId, feeAmount);
                }
            }
            else
            {
                _logger?.LogWarning("Order {OrderId}: Admin role not found. Fee {FeeAmount} not distributed.", 
                    message.OrderId, feeAmount);
            }

            // Get seller account from Shop
            if (product.Shop?.Account != null)
            {
                var sellerAccount = product.Shop.Account;
                if (sellerAccount.Balance == null)
                    sellerAccount.Balance = 0;

                // Add remaining amount to seller account
                sellerAccount.Balance += sellerAmount;
                sellerAccount.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.GenericRepository<Account>().Update(sellerAccount);
                _logger?.LogInformation("Order {OrderId}: Added {SellerAmount} to seller account {SellerAccountId} (Total: {TotalAmount}, Fee: {FeeAmount})", 
                    message.OrderId, sellerAmount, sellerAccount.Id, message.Amount, feeAmount);
            }
            else
            {
                _logger?.LogWarning("Order {OrderId}: Seller account not found. Seller amount {SellerAmount} not distributed.", 
                    message.OrderId, sellerAmount);
            }

            // Update order status to Completed
            order.Status = OrderStatus.Completed;
            order.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.GenericRepository<Order>().Update(order);
            _logger?.LogInformation("Order {OrderId}: Payment processed successfully. Setting status to Completed", message.OrderId);

            // Update ProductVariant stock (only after payment is confirmed)
            if (order.ProductVariant != null)
            {
                var variant = order.ProductVariant;
                if (variant.Stock != null && variant.Stock >= order.Quantity)
                {
                    variant.Stock = variant.Stock.Value - order.Quantity;
                    variant.UpdatedAt = DateTime.UtcNow;
                    _unitOfWork.GenericRepository<Productvariant>().Update(variant);
                    _logger?.LogInformation("Order {OrderId}: Deducted {Quantity} from ProductVariant {VariantId} stock. New stock: {NewStock}", 
                        message.OrderId, order.Quantity, variant.Id, variant.Stock);
                }
                else
                {
                    _logger?.LogWarning("Order {OrderId}: Cannot deduct stock. Current stock: {Stock}, Requested: {Quantity}", 
                        message.OrderId, variant.Stock ?? 0, order.Quantity);
                }
            }

            // Update ProductStorage status to true (sold) in Result JSON (only after payment is confirmed)
            // Get ProductStorages that were assigned to this order (from payload storage IDs)
            if (!string.IsNullOrEmpty(order.Payload))
            {
                try
                {
                    var payloadAccounts = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(order.Payload);
                    if (payloadAccounts != null && payloadAccounts.Count > 0)
                    {
                        // Extract ProductStorage IDs from payload
                        var storageIds = payloadAccounts
                            .Where(pa => pa.ContainsKey("storageId"))
                            .Select(pa =>
                            {
                                if (pa["storageId"] != null && int.TryParse(pa["storageId"].ToString(), out var id))
                                    return id;
                                return (int?)null;
                            })
                            .Where(id => id.HasValue)
                            .Select(id => id!.Value)
                            .ToList();

                        if (storageIds.Count > 0)
                        {
                            // Get specific ProductStorages by IDs
                            var storagesToUpdate = await _unitOfWork.GenericRepository<Productstorage>()
                                .Get(ps => storageIds.Contains(ps.Id))
                                .ToListAsync();

                            int updatedCount = 0;
                            foreach (var storage in storagesToUpdate)
                            {
                                try
                                {
                                    var accountData = JsonSerializer.Deserialize<Dictionary<string, object>>(storage.Result ?? "{}");
                                    if (accountData != null)
                                    {
                                        // Check if this storage is not sold yet
                                        bool isSold = false;
                                        if (accountData.TryGetValue("status", out var statusObj))
                                        {
                                            var statusValue = statusObj?.ToString();
                                            if (bool.TryParse(statusValue, out var status))
                                            {
                                                isSold = status;
                                            }
                                        }

                                        // Only update if not sold yet
                                        if (!isSold)
                                        {
                                            accountData["status"] = true; // true = sold
                                            storage.Result = JsonSerializer.Serialize(accountData);
                                            _unitOfWork.GenericRepository<Productstorage>().Update(storage);
                                            updatedCount++;
                                            _logger?.LogInformation("Order {OrderId}: Updated ProductStorage {StorageId} status to sold", 
                                                message.OrderId, storage.Id);
                                        }
                                        else
                                        {
                                            _logger?.LogWarning("Order {OrderId}: ProductStorage {StorageId} is already sold", 
                                                message.OrderId, storage.Id);
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    _logger?.LogWarning(ex, "Order {OrderId}: Error updating ProductStorage {StorageId}", 
                                        message.OrderId, storage.Id);
                                }
                            }

                            if (updatedCount < order.Quantity)
                            {
                                _logger?.LogWarning("Order {OrderId}: Only updated {UpdatedCount} ProductStorages, but order quantity is {Quantity}", 
                                    message.OrderId, updatedCount, order.Quantity);
                            }
                            else
                            {
                                _logger?.LogInformation("Order {OrderId}: Successfully updated {UpdatedCount} ProductStorages to sold status", 
                                    message.OrderId, updatedCount);
                            }
                        }
                        else
                        {
                            _logger?.LogWarning("Order {OrderId}: No ProductStorage IDs found in payload", message.OrderId);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Order {OrderId}: Error parsing payload to update ProductStorage status", message.OrderId);
                }
            }

            // Log before saving
            _logger?.LogInformation("Order {OrderId}: Saving changes with Status: {Status}, Fee: {FeeAmount}, SellerAmount: {SellerAmount}", 
                message.OrderId, order.Status, feeAmount, sellerAmount);

            // Save changes
            await _unitOfWork.SaveChangeAsync();
        }
        catch (Exception ex)
        {
            throw new Exception($"Error processing payment from queue: {ex.Message}", ex);
        }
    }
}