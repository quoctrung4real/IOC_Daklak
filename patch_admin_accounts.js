const fs = require('fs');

// 1. Update quan-tri.html
let html = fs.readFileSync('quan-tri.html', 'utf8');

const newAccountsHtml = `
        <!-- Quản lý Tài Khoản -->
        <div id="accounts-tab" class="tab-content">
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 0;">Danh sách Tài Khoản Người Dùng</h3>
                    <div class="search-box">
                        <input type="text" id="searchAccountInput" placeholder="Tìm kiếm tài khoản..." style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-family: 'Inter', sans-serif;">
                        <button style="padding: 8px 15px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-search"></i></button>
                    </div>
                </div>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                <th style="padding: 15px 12px; text-align: left; color: #475569; font-weight: 600;">Người dùng</th>
                                <th style="padding: 15px 12px; text-align: left; color: #475569; font-weight: 600;">Mật khẩu</th>
                                <th style="padding: 15px 12px; text-align: left; color: #475569; font-weight: 600;">Vai trò</th>
                                <th style="padding: 15px 12px; text-align: left; color: #475569; font-weight: 600;">Trạng thái</th>
                                <th style="padding: 15px 12px; text-align: left; color: #475569; font-weight: 600;">Ngày đăng ký</th>
                                <th style="padding: 15px 12px; text-align: center; color: #475569; font-weight: 600;">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            <!-- Users render here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
`;

// Extract old accounts-tab
const oldAccountsStart = html.indexOf('<!-- Quản lý Tài Khoản -->');
const oldAccountsEnd = html.indexOf('</div>\n</div>\n\n<script src="https://cdn.quilljs.com/');

if (oldAccountsStart !== -1 && oldAccountsEnd !== -1) {
    html = html.substring(0, oldAccountsStart) + newAccountsHtml + html.substring(oldAccountsEnd);
    fs.writeFileSync('quan-tri.html', html);
    console.log("Patched quan-tri.html accounts tab");
}

// 2. Update quan-tri.js loadUsers function
let js = fs.readFileSync('quan-tri.js', 'utf8');

const newLoadUsersFn = `
    async function loadUsers() {
        try {
            const res = await fetch('http://localhost:5000/api/nguoi-dung');
            const users = await res.json();
            const tbody = document.getElementById('usersTableBody');
            tbody.innerHTML = '';
            
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #888;">Chưa có người dùng nào.</td></tr>';
                return;
            }
            
            users.forEach(u => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #f1f5f9';
                tr.style.transition = 'background 0.2s';
                tr.onmouseover = () => tr.style.background = '#f8fafc';
                tr.onmouseout = () => tr.style.background = 'transparent';
                
                // Demo logic for Roles and Status based on username
                let role = '<span style="background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Người dùng</span>';
                if (u.Username.toLowerCase().includes('admin')) {
                    role = '<span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Quản trị viên</span>';
                }
                
                let status = '<span style="display: flex; align-items: center; gap: 5px; color: #10b981; font-weight: 500;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>Hoạt động</span>';
                
                tr.innerHTML = \`
                    <td style="padding: 15px 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                                \${u.Username.charAt(0).toUpperCase()}
                            </div>
                            <span style="font-weight: 600; color: #0f172a;">\${u.Username}</span>
                        </div>
                    </td>
                    <td style="padding: 15px 12px; font-family: monospace; color: #64748b;">\${u.Password.replace(/./g, '*')}</td>
                    <td style="padding: 15px 12px;">\${role}</td>
                    <td style="padding: 15px 12px;">\${status}</td>
                    <td style="padding: 15px 12px; color: #64748b;">\${u.RegisterDate}</td>
                    <td style="padding: 15px 12px; text-align: center;">
                        <button title="Sửa" style="background: none; border: none; color: #3b82f6; cursor: pointer; margin-right: 8px; font-size: 15px;" onclick="alert('Chức năng sửa thông tin chưa khả dụng')"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button title="Khóa/Xóa" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 15px;" onclick="alert('Chức năng khóa tài khoản chưa khả dụng')"><i class="fa-solid fa-ban"></i></button>
                    </td>
                \`;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error('Lỗi khi tải danh sách người dùng:', err);
        }
    }
`;

// Extract old loadUsersFn from quan-tri.js
const oldLoadUsersStart = js.indexOf('async function loadUsers() {');
const oldLoadUsersEnd = js.indexOf('        } catch (err) {', oldLoadUsersStart);
if (oldLoadUsersStart !== -1 && oldLoadUsersEnd !== -1) {
    const endBlock = js.indexOf('}', oldLoadUsersEnd + 25) + 1;
    
    js = js.substring(0, oldLoadUsersStart) + newLoadUsersFn.trim() + js.substring(endBlock);
    fs.writeFileSync('quan-tri.js', js);
    console.log("Patched quan-tri.js loadUsers");
}
