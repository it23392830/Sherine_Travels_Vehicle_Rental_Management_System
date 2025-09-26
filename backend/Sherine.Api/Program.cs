using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Sherine.Api.Data;
using Sherine.Api.Models;
using Sherine.Api.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- Configuration ---
var configuration = builder.Configuration;

// Add DB (Postgres)
static string BuildPostgresConnectionString(IConfiguration config)
{
    // Priority: ConnectionStrings:DefaultConnection → POSTGRESQLCONNSTR_DefaultConnection → DATABASE_URL
    var fromConfig = config.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrWhiteSpace(fromConfig)) return fromConfig!;

    var fromAzureConnStr = Environment.GetEnvironmentVariable("POSTGRESQLCONNSTR_DefaultConnection");
    if (!string.IsNullOrWhiteSpace(fromAzureConnStr)) return fromAzureConnStr!;

    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    if (!string.IsNullOrWhiteSpace(databaseUrl))
    {
        // Support URLs like: postgres://user:pass@host:5432/dbname
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':');
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var host = uri.Host;
        var port = uri.Port <= 0 ? 5432 : uri.Port;
        var db = uri.AbsolutePath.TrimStart('/');
        return $"Host={host};Port={port};Database={db};Username={username};Password={password};SslMode=Require;Trust Server Certificate=true";
    }

    throw new InvalidOperationException("No PostgreSQL connection string found. Set ConnectionStrings:DefaultConnection or POSTGRESQLCONNSTR_DefaultConnection or DATABASE_URL.");
}

var connectionString = BuildPostgresConnectionString(configuration);

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql =>
    {
        npgsql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
    }));

// Add Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication
var jwtSettings = configuration.GetSection("JwtSettings");
var secretKey = jwtSettings.GetValue<string>("Secret") ?? throw new InvalidOperationException("Missing JWT secret");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

// Application services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<DbInitializer>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ Add CORS (origins from config, fallback to localhost)
var allowedOrigins = configuration.GetValue<string>("FrontendOrigins") ?? "http://localhost:3000";
var allowedOriginsArray = allowedOrigins
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(allowedOriginsArray)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// ✅ Ensure DB migrations and seed roles/admins on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate(); // Apply any pending migrations

    var initializer = scope.ServiceProvider.GetRequiredService<DbInitializer>();
    await initializer.SeedRolesAndAdminAsync(); // Seed roles + Owner + Manager
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // In development, allow HTTP without redirect to simplify local frontend calls
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// ✅ Enable CORS before authentication
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
