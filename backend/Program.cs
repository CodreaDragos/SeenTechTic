using WebAPIDemo.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using WebAPIDemo.Repositories;
using WebAPIDemo.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(x => x.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Register repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IFieldRepository, FieldRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();

// Register services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<ILoggerService, LoggerService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IReservationService, ReservationService>();

// JWT Authentication setup
var jwtSecret = builder.Configuration["JwtSettings:SecretKey"];
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

// CORS pentru Angular (ADĂUGAT AICI)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod(); // This must include DELETE
    });
});
var app = builder.Build();

// Middleware   
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Commented out for development

// CORS ACTIVAT (ADĂUGAT AICI)
app.UseCors("AllowAngular");

// Add authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();