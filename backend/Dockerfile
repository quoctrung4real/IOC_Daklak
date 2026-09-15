FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Backend.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish Backend.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
COPY --from=build /app/publish .
# Run using shell form so $PORT is evaluated at runtime by Render
CMD ASPNETCORE_URLS="http://+:${PORT:-5100}" dotnet Backend.dll
