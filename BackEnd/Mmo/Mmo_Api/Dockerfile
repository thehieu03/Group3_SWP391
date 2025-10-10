FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Mmo_Api/Mmo_Api.csproj", "Mmo_Api/"]
COPY ["Mmo_Application/Mmo_Application.csproj", "Mmo_Application/"]
COPY ["Mmo_Infrastructure/Mmo_Infrastructure.csproj", "Mmo_Infrastructure/"]
COPY ["Mmo_Domain/Mmo_Domain.csproj", "Mmo_Domain/"]
RUN dotnet restore "Mmo_Api/Mmo_Api.csproj"
COPY . .
WORKDIR "/src/Mmo_Api"
RUN dotnet build "./Mmo_Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Mmo_Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Mmo_Api.dll"]
