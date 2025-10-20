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
        CreateMap<Product, ProductRequest>().ReverseMap();
        CreateMap<Order, OrderResponse>().ReverseMap();
        CreateMap<ProfileUpdateRequest, Account>().ReverseMap();
        CreateMap<Account, UserResponse>().ReverseMap();
        CreateMap<Shop, ShopResponse>().ReverseMap();
    }
}