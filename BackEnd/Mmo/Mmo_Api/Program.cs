using Mmo_Api.Boostraping;

namespace Mmo_Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.RegisterAppMiddleware(builder.Configuration);

        var app = builder.Build();
        app.UseAppMiddleware(builder.Configuration);
    }
}