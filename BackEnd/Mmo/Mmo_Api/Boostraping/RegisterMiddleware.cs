using Microsoft.Extensions.FileProviders;
namespace Mmo_Api.Boostraping;

public static class RegisterMiddleware
{
    public static WebApplicationBuilder RegisterAppMiddleware(this WebApplicationBuilder builder,
        IConfiguration configuration)
    {
        var connStr = configuration.GetConnectionString("DefaultConnection");
        builder.Services.AddAuthorization();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                options.JsonSerializerOptions.WriteIndented = true;
            })
            .AddOData(options =>
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
        builder.Services.AddAutoMapper(typeof(Helper.MapperClass));
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

        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy =>
                policy.RequireRole("ADMIN"));

            options.AddPolicy("UserOrAdminSeller", policy =>
                policy.RequireRole("USER", "ADMIN", "SELLER"));
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
        builder.Services.AddScoped<ISubcategoryServices, SubcategoryServices>();
        builder.Services.AddScoped<ISupportticketServices, SupportticketServices>();
        builder.Services.AddScoped<ISystemsconfigServices, SystemsconfigServices>();
        builder.Services.AddScoped<ITextMessageServices, TextMessageServices>();
        builder.Services.AddScoped<ITokenServices, TokenServices>();
        builder.Services.AddScoped<IDashboardServices, DashboardServices>();
        builder.Services.AddScoped<IEmailService, EmailService>();
        // Removed image service DI; using static HelperImage methods instead


        builder.Services.AddScoped<IDbConnection>(provider =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            return new MySqlConnection(connectionString);
        });
        builder.Services.AddScoped<IDapperService, DapperService>();

        return builder;
    }

    public static WebApplication UseAppMiddleware(this WebApplication app, IConfiguration configuration)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        // HTTPS redirection first
        app.UseHttpsRedirection();

        // Serve static files from default wwwroot (if any)
        app.UseStaticFiles();

        // Explicitly serve the Images folder at /Images
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "Images")),
            RequestPath = "/Images"
        });

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
        return app;
    }
}