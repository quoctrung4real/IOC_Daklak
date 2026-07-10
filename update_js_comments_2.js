const fs = require('fs');

function replaceInFile(file, replacements) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    for (const [eng, vie] of Object.entries(replacements)) {
        const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        code = code.replace(regex, vie);
    }
    fs.writeFileSync(file, code);
}

const hoSoReplacements = {
    '// User not logged in': '// Chưa đăng nhập',
    '// User logged in': '// Đã đăng nhập',
    '// Avatar upload preview': '// Xem trước hình ảnh tải lên',
    '// Remove avatar': '// Xóa hình ảnh',
    '// Form submission': '// Xử lý gửi biểu mẫu',
    '// Populate basic info': '// Điền thông tin cơ bản',
    '// Populate avatar': '// Hiển thị ảnh đại diện',
    '// If it\'s a relative path starting with /, prefix with API host': '// Nếu là đường dẫn tương đối, thêm tên miền API',
    '// Check file type': '// Kiểm tra định dạng tệp',
    '// Show preview': '// Hiển thị xem trước',
    '// clear input': '// Xóa dữ liệu đầu vào',
    '// Mark for removal': '// Đánh dấu để xóa',
    '// If no new file but changed, might be removal': '// Nếu không có file mới nhưng bị thay đổi, có thể là do bị xóa',
    '// Validate password': '// Xác thực mật khẩu',
    '// Disable button to prevent double submit': '// Vô hiệu hóa nút để tránh gửi trùng lặp',
    '// Upload new avatar if changed and not just removed': '// Tải lên ảnh mới nếu có thay đổi và không phải bị xóa',
    '// explicitly set to null': '// Đặt giá trị null rõ ràng',
    '// Prepare update payload': '// Chuẩn bị dữ liệu cập nhật',
    '// Call API': '// Gọi API',
    '// Clear password fields': '// Làm trống các trường mật khẩu',
    '// Reset flags': '// Đặt lại các cờ trạng thái'
};

const binhLuanReplacements = {
    '// Auth Prompt Links': '// Liên kết hiển thị đăng nhập',
    '// Attach like event': '// Thêm sự kiện thích',
    '// update local cache': '// Cập nhật bộ đệm cục bộ'
};

replaceInFile('ho-so.js', hoSoReplacements);
replaceInFile('binh-luan.js', binhLuanReplacements);

