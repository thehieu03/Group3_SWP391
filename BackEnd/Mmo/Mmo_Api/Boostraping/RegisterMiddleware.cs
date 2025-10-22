using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Mmo_Application.Services;
using Mmo_Application.Services.Interface;
using Mmo_Domain.IUnit;
using Mmo_Domain.Models;
using Mmo_Infrastructure.Unit;

namespace Mmo_Api.Boostraping;

public static class RegisterMiddleware
{
    public static WebApplicationBuilder RegisterAppMiddleware(this WebApplicationBuilder builder,
        IConfiguration configuration)
    {
        var connStr = configuration.GetConnectionString("DefaultConnection");
        builder.Services.AddAuthorization();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddControllers().AddOData(options =>
        {
            options.Select().Filter().OrderBy().Expand().Count().SetMaxTop(100);
        });
        builder.Services.AddSwaggerGen();
        builder.Services.AddDbContext<AppDbContext>(options =>
        {
            options.UseMySql(
                connStr,
                ServerVersion.AutoDetect(connStr),
                mySqlOptions => mySqlOptions.EnableRetryOnFailure()
            );
        });
        builder.Services.AddAutoMapper(typeof(Program).Assembly);
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(jwtOptions =>
            {
                jwtOptions.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ?? throw new Exception("Jwt Key not found")))
                };
            });
        builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
        builder.Services.AddScoped<IAccountRoleServices, AccountRoleServices>();
        builder.Services.AddScoped<IAccountServices, AccountServices>();
        builder.Services.AddScoped<ICategoryServices, CategoryServices>();
        builder.Services.AddScoped<IFeedbackServices, FeedbackServices>();
        builder.Services.AddScoped<IImageMessageServices, ImageMessageServices>();
        builder.Services.AddScoped<IMessageServices, MessageServices>();
        builder.Services.AddScoped<IOrderServices, OrderServices>();
        builder.Services.AddScoped<IPaymenttransactionServices, PaymenttransactionServices>();
        builder.Services.AddScoped<IProductServices, ProductServices>();
        builder.Services.AddScoped<IProductStorageServices, ProductStorageServices>();
        builder.Services.AddScoped<IProductVariantServices, ProductVariantServices>();
        builder.Services.AddScoped<IReplyServices, ReplyServices>();
        builder.Services.AddScoped<IRoleServices, RoleServices>();
        builder.Services.AddScoped<IShopServices, ShopServices>();
<<<<<<< Updated upstream
        builder.Services.AddScoped<ISubcategoryServices, SubcategoryServices>();
=======
>>>>>>> Stashed changes
        builder.Services.AddScoped<ISupportTicketServices, SupportticketServices>();
        builder.Services.AddScoped<ISystemsconfigServices, SystemsconfigServices>();
        builder.Services.AddScoped<ITextMessageServices, TextMessageServices>();
        builder.Services.AddScoped<ITokenServices, TokenServices>();

        return builder;
    }

    public static WebApplication UseAppMiddleware(this WebApplication app, IConfiguration configuration)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.MapControllers();
        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();
        app.Run();
        return app;
    }
}