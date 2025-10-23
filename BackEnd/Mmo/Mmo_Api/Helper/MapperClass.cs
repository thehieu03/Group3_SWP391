using Mmo_Domain.ModelResponse;
using Mmo_Domain.Models;
using Mmo_Domain.ModelRequest;

namespace Mmo_Api.Helper;

public class MapperClass : Profile
{
    public MapperClass()
    {
        CreateMap<RoleRequest, Role>().ReverseMap();
        CreateMap<Category,CategoryResponse>().ReverseMap();
        CreateMap<Category, CategoryRequest>().ReverseMap();
        CreateMap<Product, ProductResponse>().ReverseMap();
        CreateMap<ProductRequest, Product>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.Ignore())
            .ForMember(dest => dest.IsApproved, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.Shop, opt => opt.Ignore())
            .ForMember(dest => dest.Subcategory, opt => opt.Ignore())
            .ForMember(dest => dest.Feedbacks, opt => opt.Ignore())
            .ForMember(dest => dest.Productvariants, opt => opt.Ignore())
            .ForMember(dest => dest.Fee, opt => opt.Ignore())
            .ForMember(dest => dest.SubcategoryId, opt => opt.Ignore());
        CreateMap<Product, ProductRequest>();
        CreateMap<Order, OrderResponse>().ReverseMap();
        CreateMap<ProfileUpdateRequest, Account>().ReverseMap();
        CreateMap<Account, UserResponse>().ReverseMap();
        CreateMap<Shop, ShopResponse>().ReverseMap();
    }
}