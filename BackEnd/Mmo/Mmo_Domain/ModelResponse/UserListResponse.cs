namespace Mmo_Domain.ModelResponse;

public class UserListResponse
{
    public IEnumerable<UserResponse> Users { get; set; } = new List<UserResponse>();
    public UserStatistics Statistics { get; set; } = new UserStatistics();
}

public class UserStatistics
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int InactiveUsers { get; set; }
    public int Customers { get; set; }
    public int Sellers { get; set; }
}
