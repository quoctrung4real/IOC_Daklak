FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY Backend.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish Backend.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
COPY --from=build /app/publish .
# Render assigns port dynamically via PORT env var
ENV ASPNETCORE_URLS=http://+:${PORT:-5100}
ENTRYPOINT ["dotnet", "Backend.dll"]
