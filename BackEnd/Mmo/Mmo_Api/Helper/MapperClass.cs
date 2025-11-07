using Mmo_Domain.ModelResponse;
using Mmo_Domain.Models;
using Mmo_Domain.ModelRequest;

namespace Mmo_Api.Helper;

public class MapperClass : Profile
{
    public MapperClass()
    {
        CreateMap<RoleRequest, Role>().ReverseMap();
        CreateMap<Category, CategoryResponse>().ReverseMap();
        CreateMap<Category, CategoryRequest>().ReverseMap();
        CreateMap<Product, ProductResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => (uint)src.Id))
            .ForMember(dest => dest.ShopId, opt => opt.MapFrom(src => (uint?)src.ShopId))
            .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => (uint?)src.CategoryId))
            .ForMember(dest => dest.SubcategoryId, opt => opt.MapFrom(src => (uint?)src.SubcategoryId))
            .ForMember(dest => dest.ShopName,
                opt => opt.MapFrom(src => src.Shop != null ? src.Shop.Name : "Unknown Shop"))
            .ForMember(dest => dest.CategoryName,
                opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : "Unknown Category"))
            .ForMember(dest => dest.SubcategoryName,
                opt => opt.MapFrom(src => src.Subcategory != null ? src.Subcategory.Name : null))
            .ForMember(dest => dest.MinPrice,
                opt => opt.MapFrom(src =>
                    src.Productvariants != null && src.Productvariants.Any()
                        ? src.Productvariants.Min(v => v.Price)
                        : (decimal?)null))
            .ForMember(dest => dest.MaxPrice,
                opt => opt.MapFrom(src =>
                    src.Productvariants != null && src.Productvariants.Any()
                        ? src.Productvariants.Max(v => v.Price)
                        : (decimal?)null))
            .ForMember(dest => dest.TotalStock,
                opt => opt.MapFrom(src => src.Productvariants != null ? src.Productvariants.Sum(v => v.Stock) : 0))
            .ForMember(dest => dest.TotalSold, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.AverageRating,
                opt => opt.MapFrom(src =>
                    src.Feedbacks != null && src.Feedbacks.Any() ? src.Feedbacks.Average(f => f.Rating ?? 0) : 0))
            .ForMember(dest => dest.ReviewCount,
                opt => opt.MapFrom(src => src.Feedbacks != null ? src.Feedbacks.Count : 0))
            .ForMember(dest => dest.ComplaintRate, opt => opt.MapFrom(src => 0))
            .ReverseMap();
        CreateMap<Product, ProductRequest>().ReverseMap();
        CreateMap<Order, OrderResponse>().ReverseMap();
        CreateMap<ProfileUpdateRequest, Account>().ReverseMap();
        CreateMap<Account, UserResponse>().ReverseMap();
        CreateMap<Shop, ShopResponse>()
            .ForMember(d => d.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(d => d.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(d => d.Description, opt => opt.MapFrom(src => src.Description))
            .ForMember(d => d.Status, opt => opt.MapFrom(src => src.Status))
            .ForMember(d => d.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(d => d.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))
            .ForMember(d => d.OwnerUsername,
                opt => opt.MapFrom(src => src.Account != null ? src.Account.Username : null))
            .ForMember(d => d.ProductCount, opt => opt.MapFrom(src => src.Products != null ? src.Products.Count : 0))
            .ForMember(d => d.ComplaintCount, opt => opt.MapFrom(src => src.Replies != null ? src.Replies.Count : 0))
            .ForMember(d => d.IdentificationFurl,
                opt => opt.MapFrom(src => src.Account != null ? src.Account.IdentificationFurl : null))
            .ForMember(d => d.IdentificationBurl,
                opt => opt.MapFrom(src => src.Account != null ? src.Account.IdentificationBurl : null));
        CreateMap<Subcategory, SubcategoryResponse>().ReverseMap();
        CreateMap<SubcategoryRequest, Subcategory>().ReverseMap();
        CreateMap<RegisterRequest, Account>().ReverseMap();
        CreateMap<Order, OrderUserResponse>()
            .ForMember(d => d.OrderId, opt => opt.MapFrom(src => src.Id))
            .ForMember(d => d.OrderDate, o => o.MapFrom(src => src.CreatedAt))
            .ForMember(d => d.Status, o => o.MapFrom(src => src.Status))
            .ForMember(d => d.SellerName, o => o.MapFrom(src => src.ProductVariant!.Product!.Shop!.Account!.Username))
            .ForMember(d => d.ShopName, o => o.MapFrom(src => src.ProductVariant!.Product!.Shop!.Name))
            .ForMember(d => d.TotalPrice, o => o.MapFrom(src => src.TotalPrice))
            .ForMember(d => d.Quantity, o => o.MapFrom(src => src.Quantity))
            .ForMember(d => d.ProductId, o => o.MapFrom(src => src.ProductVariant!.ProductId))
            .ForMember(d => d.ProductName, o => o.MapFrom(src => src.ProductVariant!.Product!.Name));
        CreateMap<Order, OrderAdminResponse>()
            .ForMember(d => d.OrderId, opt => opt.MapFrom(src => src.Id))
            .ForMember(d => d.OrderDate, o => o.MapFrom(src => src.CreatedAt))
            .ForMember(d => d.Status, o => o.MapFrom(src => src.Status))
            .ForMember(d => d.SellerName, o => o.MapFrom(src => src.ProductVariant!.Product!.Shop!.Account!.Username))
            .ForMember(d => d.ShopName, o => o.MapFrom(src => src.ProductVariant!.Product!.Shop!.Name))
            .ForMember(d => d.TotalPrice, o => o.MapFrom(src => src.TotalPrice))
            .ForMember(d => d.BuyerName, o => o.MapFrom(src => src.Account!.Username))
            .ForMember(d => d.Quantity, o => o.MapFrom(src => src.Quantity));
        CreateMap<Feedback, FeedbackRequest>().ReverseMap();

        CreateMap<Supportticket, SupportTicketResponse>()
            .ForMember(d => d.Id, o => o.MapFrom(src => src.Id))
            .ForMember(d => d.AccountId, o => o.MapFrom(src => src.AccountId))
            .ForMember(d => d.Email, o => o.MapFrom(src => src.Email))
            .ForMember(d => d.Phone, o => o.MapFrom(src => src.Phone))
            .ForMember(d => d.Title, o => o.MapFrom(src => src.Title))
            .ForMember(d => d.Content, o => o.MapFrom(src => src.Content))
            .ForMember(d => d.CreatedAt, o => o.MapFrom(src => src.CreatedAt))
            .ForMember(d => d.Status, o => o.MapFrom(src => src.Status ?? "PENDING"))
            .ForMember(d => d.Account, o => o.MapFrom(src => src.Account != null
                ? new AccountMiniResponse
                {
                    Id = src.Account.Id,
                    Username = src.Account.Username,
                    Email = src.Account.Email
                }
                : null));
        CreateMap<Supportticket, SupportTicketRequest>().ReverseMap();
        CreateMap<Order, OrderResponse>().ReverseMap();
        CreateMap<ProfileUpdateRequest, Account>().ReverseMap();

        // Payment transaction → response with sensible defaults
        CreateMap<Paymenttransaction, PaymentHistoryResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId ?? 0))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
            .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.Amount))
            .ForMember(dest => dest.PaymentDescription, opt => opt.MapFrom(src => src.PaymentDescription))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Status) ? "UNKNOWN" : src.Status))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt ?? DateTime.MinValue))
            .ReverseMap();
    }
}