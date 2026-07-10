const fs = require('fs');

function replaceInFile(file, replacements) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    for (const [eng, vie] of Object.entries(replacements)) {
        // Use global regex if it's a string or exact match
        const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        code = code.replace(regex, vie);
    }
    fs.writeFileSync(file, code);
}

const trangChuReplacements = {
    '// ===== SCROLL TO TOP =====': '// ===== CUỘN LÊN ĐẦU TRANG =====',
    '// ===== STICKY HEADER LOGO =====': '// ===== LOGO HEADER CỐ ĐỊNH =====',
    '// ===== SEARCH TOGGLE =====': '// ===== BẬT/TẮT TÌM KIẾM =====',
    '// Close on clicking outside': '// Đóng khi click ra ngoài',
    '// ===== MOBILE MENU =====': '// ===== MENU ĐIỆN THOẠI =====',
    '// ===== DOCUMENT TABS =====': '// ===== CHUYỂN TAB TÀI LIỆU =====',
    '// Remove active from all tabs': '// Xóa trạng thái active của tất cả các tab',
    '// Show/hide tab content': '// Hiển thị/ẩn nội dung tab',
    '// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====': '// ===== OBSERVER ĐỂ CHẠY ANIMATION KHI CUỘN =====',
    '// Observe animated elements': '// Theo dõi các phần tử có hiệu ứng animation',
    '// Sidebar Accordion Logic': '// Xử lý đóng mở Accordion (Sidebar)',
    '// ===== API INTEGRATION (C# BACKEND) =====': '// ===== TÍCH HỢP API (C# BACKEND) =====',
    '// Keep the first 3 items (or replace them entirely, let\'s prepend to the list)': '// Giữ 3 mục đầu (hoặc thay thế toàn bộ, thêm vào đầu danh sách)',
    '// Only show latest 3 for layout consistency': '// Chỉ hiển thị 3 tin mới nhất để giữ nguyên bố cục',
    '// You can replace innerHTML or just prepend': '// Có thể thay thế nội dung (innerHTML) hoặc chèn lên đầu',
    '// Here we replace the existing list with the dynamic list if there\'s any dynamic news': '// Ở đây thay thế danh sách hiện tại bằng danh sách động nếu có tin mới',
    '// Initialize on page load': '// Khởi tạo khi tải trang',
    '// Only fetch if we are on the support page': '// Chỉ tải nếu đang ở trang Hỗ trợ',
    '// Only fetch if we are on the history page': '// Chỉ tải nếu đang ở trang Lịch sử',
    '// Only fetch if we are on the about page': '// Chỉ tải nếu đang ở trang Giới thiệu',
    '// Only fetch if we are on the products page': '// Chỉ tải nếu đang ở trang Sản phẩm',
    '// Only fetch if we are on the orgchart page': '// Chỉ tải nếu đang ở trang Sơ đồ tổ chức',
    '// Only fetch if we are on the struct page': '// Chỉ tải nếu đang ở trang Cơ cấu tổ chức',
    '// Only fetch if we are on the baolu page': '// Chỉ tải nếu đang ở trang Bão lũ'
};

const xacThucReplacements = {
    '// Inject auth CSS': '// Chèn CSS phần xác thực',
    '// Inject auth HTML directly (avoid fetch issues with file:// protocol)': '// Chèn trực tiếp HTML phần xác thực (tránh lỗi fetch do dùng file://)',
    '// Check if user is logged in': '// Kiểm tra xem người dùng đã đăng nhập chưa',
    '// Toggle dropdown': '// Bật/tắt menu tài khoản',
    '// Show modal': '// Hiển thị popup đăng nhập',
    '// Close dropdown if clicked outside': '// Đóng menu tài khoản nếu click ra ngoài',
    '// Modal Close': '// Xử lý đóng popup',
    '// Tabs switching': '// Chuyển tab Đăng nhập / Đăng ký',
    '// Handle Login': '// Xử lý sự kiện Đăng nhập',
    '// trigger an event so other scripts know user logged in': '// Gửi sự kiện để các script khác biết người dùng đã đăng nhập',
    '// Handle Register': '// Xử lý sự kiện Đăng ký',
    '// Handle Logout': '// Xử lý sự kiện Đăng xuất',
    '// Handle Forgot Password': '// Xử lý sự kiện Quên mật khẩu'
};

const quanTriReplacements = {
    '// Search users': '// Tìm kiếm người dùng',
    '// Init': '// Khởi tạo',
    '// --- User Management Logic ---': '// --- Xử lý Quản lý người dùng ---',
    '// Loại bỏ nền xám (background) và màu chữ khi paste từ web khác vào': '// Loại bỏ nền xám (background) và màu chữ khi paste từ web khác vào'
};

const hoSoReplacements = {
    '// Logout inside profile page': '// Đăng xuất từ trang hồ sơ',
    '// Preview Avatar': '// Xem trước ảnh đại diện',
    '// Remove Avatar': '// Xóa ảnh đại diện'
};

replaceInFile('trang-chu.js', trangChuReplacements);
replaceInFile('xac-thuc.js', xacThucReplacements);
replaceInFile('quan-tri.js', quanTriReplacements);
replaceInFile('ho-so.js', hoSoReplacements);

