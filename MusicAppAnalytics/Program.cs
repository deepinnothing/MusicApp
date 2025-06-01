using EasyNetQ;
using MusicAppAnalytics.Services;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

builder.Services.AddSingleton<AlbumAnalyticsService>();
builder.Services.AddLogging(config =>
{
    config.ClearProviders();
    config.AddConfiguration(builder.Configuration.GetSection("Logging"));
    config.AddDebug();
    config.AddEventSourceLogger();
    if (builder.Environment.IsDevelopment())
        config.AddConsole();
});

// Register EasyNetQ IBus
builder.Services.AddSingleton(RabbitHutch.CreateBus("host=localhost"));

WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();

app.Run();