#!/bin/bash
# Script đóng gói mã nguồn IOC Đắk Lắk (Bản sạch - Không chứa lịch sử git và secret)

echo "Đang chuẩn bị thư mục đóng gói..."

PACKAGE_DIR="ioc-daklak-package"
rm -rf $PACKAGE_DIR
mkdir -p $PACKAGE_DIR

# Copy toàn bộ mã nguồn vào thư mục tạm, loại trừ ngay lập tức thư mục .git
echo "Đang copy mã nguồn..."
rsync -a --exclude='.git' --exclude='ioc-daklak-package' --exclude='*.zip' . $PACKAGE_DIR/

echo "Đang làm sạch các file dư thừa..."
# Xoá các thư mục bin, obj của backend nếu có
rm -rf $PACKAGE_DIR/backend/bin
rm -rf $PACKAGE_DIR/backend/obj

# Xóa file .env chứa secret, chỉ giữ lại .env.example
if [ -f "$PACKAGE_DIR/backend/.env" ]; then
    rm -f $PACKAGE_DIR/backend/.env
    echo "Đã xóa backend/.env thật để tránh lộ secret."
fi

echo "Đang tạo file nén ZIP..."
ZIP_NAME="IOC_DakLak_SourceCode_$(date +%Y%m%d).zip"
cd $PACKAGE_DIR
zip -rq ../$ZIP_NAME ./*
cd ..

echo "Làm sạch thư mục tạm..."
rm -rf $PACKAGE_DIR

echo "Hoàn tất! File đóng gói: $ZIP_NAME"
echo "Bạn có thể bàn giao file ZIP này."
