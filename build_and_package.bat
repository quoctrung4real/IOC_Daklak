@echo off
REM Script đóng gói mã nguồn IOC Đắk Lắk trên Windows

echo Dang chuan bi thu muc dong goi...
set PACKAGE_DIR=ioc-daklak-package

if exist "%PACKAGE_DIR%" rmdir /s /q "%PACKAGE_DIR%"
mkdir "%PACKAGE_DIR%"

echo Dang copy ma nguon...
xcopy /E /I /H /Y /EXCLUDE:exclude_list.txt . "%PACKAGE_DIR%"

echo Dang lam sach cac file du thua...
if exist "%PACKAGE_DIR%\backend\bin" rmdir /s /q "%PACKAGE_DIR%\backend\bin"
if exist "%PACKAGE_DIR%\backend\obj" rmdir /s /q "%PACKAGE_DIR%\backend\obj"

if exist "%PACKAGE_DIR%\backend\.env" (
    del /q "%PACKAGE_DIR%\backend\.env"
    echo Da xoa backend\.env that de tranh lo secret.
)

echo Dang tao file nen ZIP (Yeu cau PowerShell)...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set ZIP_NAME=IOC_DakLak_SourceCode_%datetime:~0,8%.zip

powershell -Command "Compress-Archive -Path '.\%PACKAGE_DIR%\*' -DestinationPath '.\%ZIP_NAME%' -Force"

echo Lam sach thu muc tam...
rmdir /s /q "%PACKAGE_DIR%"

echo Hoan tat! File dong goi: %ZIP_NAME%
echo Ban co the ban giao file ZIP nay.
pause
