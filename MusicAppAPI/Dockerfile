# Use the official .NET 8.0 SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy the project file and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the remaining source code, build and publish the application
COPY . ./
RUN dotnet publish -c Release -o out

# Use the official .NET 8.0 ASP.NET runtime image for the final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
# Copy the published output from the build stage
COPY --from=build /app/out .

# Set environment variables for ASP.NET and RabbitMQ
ENV ASPNETCORE_URLS="http://+:80"
ENV ASPNETCORE_ENVIRONMENT="Development"
ENV RabbitMQ__Host="rabbitmq"
ENV RabbitMQ__Port="5672"
ENV RabbitMQ__Username="guest"
ENV RabbitMQ__Password="guest"

# Turn off HTTPS redirection and certificates
ENV DOTNET_SYSTEM_CONSOLE_ALLOW_ANSI_COLOR_REDIRECTION=1
ENV COMPlus_EnableDiagnostics=0

EXPOSE 80

# Start the application
ENTRYPOINT ["dotnet", "MusicAppAPI.dll"]