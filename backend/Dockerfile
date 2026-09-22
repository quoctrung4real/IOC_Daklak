FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Backend.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish Backend.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app

# Cài đặt wget, tải Piper TTS và giải nén
RUN apt-get update && apt-get install -y wget tar && \
    wget https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_linux_x86_64.tar.gz && \
    tar -xzf piper_linux_x86_64.tar.gz -C /usr/local/bin && \
    chmod +x /usr/local/bin/piper/piper && \
    rm piper_linux_x86_64.tar.gz && \
    apt-get clean

# Tải Model Tiếng Việt (vivos x_low)
RUN mkdir -p /app/tts_models && \
    wget -q https://huggingface.co/rhasspy/piper-voices/resolve/main/vi/vi_VN/vivos/x_low/vi_VN-vivos-x_low.onnx -O /app/tts_models/vi_VN-vivos.onnx && \
    wget -q https://huggingface.co/rhasspy/piper-voices/resolve/main/vi/vi_VN/vivos/x_low/vi_VN-vivos-x_low.onnx.json -O /app/tts_models/vi_VN-vivos.onnx.json

COPY --from=build /app/publish .
# Run using shell form so $PORT is evaluated at runtime by Render
CMD ASPNETCORE_URLS="http://+:${PORT:-5100}" dotnet Backend.dll
