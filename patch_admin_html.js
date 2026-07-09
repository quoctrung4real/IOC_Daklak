const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// Add Sidebar Menu Item
const accountMenuHtml = `
        <a href="#" class="menu-item" data-tab="accounts-tab">
            <i class="fa-solid fa-users"></i> Quản lý Tài Khoản
        </a>
`;

// Insert after "Cơ Cấu Tổ Chức"
if (!html.includes('data-tab="accounts-tab"')) {
    const structMenuRegex = /<a href="#" class="menu-item" data-tab="struct-tab">\s*<i class="fa-solid fa-sitemap"><\/i> Cơ Cấu Tổ Chức\s*<\/a>/;
    html = html.replace(structMenuRegex, '<a href="#" class="menu-item" data-tab="struct-tab">\n                <i class="fa-solid fa-sitemap"></i> Cơ Cấu Tổ Chức\n            </a>\n' + accountMenuHtml);
}

// Add Tab Content
const accountTabHtml = `
        <!-- Quản lý Tài Khoản -->
        <div id="accounts-tab" class="tab-content">
            <div class="card">
                <h3>Danh sách Tài Khoản Người Dùng</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="background: #f5f7fa; border-bottom: 2px solid #ddd;">
                            <th style="padding: 12px; text-align: left;">Tên đăng nhập</th>
                            <th style="padding: 12px; text-align: left;">Mật khẩu</th>
                            <th style="padding: 12px; text-align: left;">Ngày đăng ký</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                        <!-- Users render here -->
                    </tbody>
                </table>
            </div>
        </div>
`;

// Insert before closing div of main-content
if (!html.includes('id="accounts-tab"')) {
    html = html.replace('    </div>\n</div>\n\n<script src="https://cdn.quilljs.com/', accountTabHtml + '\n    </div>\n</div>\n\n<script src="https://cdn.quilljs.com/');
}

fs.writeFileSync('admin.html', html);
console.log("Patched admin.html");
