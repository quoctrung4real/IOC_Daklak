const fs = require('fs');
let js = fs.readFileSync('quan-tri.js', 'utf8');

// Insert a function to load users
const loadUsersFn = `
    async function loadUsers() {
        try {
            const res = await fetch('http://localhost:5000/api/nguoi-dung');
            const users = await res.json();
            const tbody = document.getElementById('usersTableBody');
            tbody.innerHTML = '';
            
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="padding: 12px; text-align: center; color: #888;">Chưa có người dùng nào.</td></tr>';
                return;
            }
            
            users.forEach(u => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #eee';
                tr.innerHTML = \`
                    <td style="padding: 12px;">\${u.Username}</td>
                    <td style="padding: 12px;">\${u.Password}</td>
                    <td style="padding: 12px;">\${u.RegisterDate}</td>
                \`;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error('Lỗi khi tải danh sách người dùng:', err);
        }
    }
`;

// Insert the function call when a tab is clicked if it's the accounts tab
// Current logic:
//     menuItems.forEach(item => {
//         item.addEventListener('click', (e) => { ...
//             document.getElementById(tabId).classList.add('active');
const updateTabLogic = `
            if (tabId === 'accounts-tab') {
                loadUsers();
            }
`;

if (!js.includes('loadUsers()')) {
    // Inject the function definition inside DOMContentLoaded
    js = js.replace('function showNotification', loadUsersFn + '\n\    function showNotification');
    
    // Inject the function call in tab switching
    js = js.replace("document.getElementById(tabId).classList.add('active');", "document.getElementById(tabId).classList.add('active');" + updateTabLogic);
}

fs.writeFileSync('quan-tri.js', js);
console.log("Patched quan-tri.js");
