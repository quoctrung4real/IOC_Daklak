const fs = require('fs');

const files = [
    'homepage.html', 'chuc-nang-nhiem-vu.html', 'dau-moi-ho-tro.html',
    'lich-su-hinh-thanh.html', 'san-pham-tieu-bieu.html', 'so-do-to-chuc.html',
    'co-cau-to-chuc.html', 'cap-nhat-bao-lu.html'
];

const authModalHtml = `
<!-- ===== AUTH MODAL ===== -->
<div class="auth-modal" id="authModal">
    <div class="auth-modal-content">
        <span class="auth-close" id="authClose">&times;</span>
        <div class="auth-tabs">
            <button class="auth-tab active" id="tabLogin">Đăng nhập</button>
            <button class="auth-tab" id="tabRegister">Đăng ký</button>
        </div>
        
        <!-- Login Form -->
        <form id="loginForm" class="auth-form active">
            <div class="form-group">
                <label>Tên đăng nhập</label>
                <input type="text" id="loginUsername" required placeholder="Nhập tên đăng nhập...">
            </div>
            <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" id="loginPassword" required placeholder="Nhập mật khẩu...">
            </div>
            <p class="auth-error" id="loginError"></p>
            <button type="submit" class="auth-submit-btn">Đăng nhập</button>
        </form>

        <!-- Register Form -->
        <form id="registerForm" class="auth-form">
            <div class="form-group">
                <label>Tên đăng nhập</label>
                <input type="text" id="registerUsername" required minlength="3" placeholder="Nhập tên đăng nhập...">
            </div>
            <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" id="registerPassword" required minlength="6" placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)...">
            </div>
            <p class="auth-error" id="registerError"></p>
            <button type="submit" class="auth-submit-btn">Đăng ký</button>
        </form>
    </div>
</div>
`;

const userIconHtml = `
                    <div class="user-dropdown-container">
                        <button class="user-btn" id="userBtn" title="Tài khoản">
                            <i class="fa-solid fa-user"></i>
                        </button>
                        <ul class="user-dropdown-menu" id="userDropdownMenu">
                            <li class="user-info-item">Xin chào, <b id="displayUsername">Guest</b></li>
                            <li><hr></li>
                            <li><a href="#" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a></li>
                        </ul>
                    </div>
`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');

    // Insert user icon next to search button
    // It's after: <button class="search-btn" id="searchBtn"> ... </button>
    // Or we can just insert it before <button class="search-btn" id="searchBtn">
    if (!html.includes('user-dropdown-container')) {
        const searchBtnRegex = /<button class="search-btn" id="searchBtn">/g;
        html = html.replace(searchBtnRegex, userIconHtml + '\n                    <button class="search-btn" id="searchBtn">');
    }

    // Insert Auth Modal before </body>
    if (!html.includes('id="authModal"')) {
        html = html.replace('</body>', authModalHtml + '\n</body>');
    }

    // Insert auth.js script before </body>
    if (!html.includes('auth.js')) {
        html = html.replace('</body>', '<script src="auth.js"></script>\n</body>');
    }

    // Remove old FontAwesome if using missing script, but it already has FontAwesome
    // Just save
    fs.writeFileSync(file, html);
});

console.log("Injected into HTML files");

// 2. Add CSS to styles.css
let css = fs.existsSync('styles.css') ? fs.readFileSync('styles.css', 'utf8') : '';
const authCss = `
/* ===== AUTH & USER MENU ===== */
.user-dropdown-container {
    position: relative;
    margin-right: 15px;
    display: flex;
    align-items: center;
}
.user-btn {
    background: none;
    border: none;
    color: var(--white);
    font-size: 1.1rem;
    cursor: pointer;
    transition: color var(--transition);
}
.user-btn:hover {
    color: var(--accent);
}
.user-dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--white);
    min-width: 180px;
    box-shadow: var(--shadow);
    border-radius: var(--radius);
    padding: 10px 0;
    margin: 10px 0 0;
    list-style: none;
    display: none; /* hidden by default */
    z-index: 1000;
}
.user-dropdown-menu.show {
    display: block;
}
.user-dropdown-menu li {
    padding: 0;
}
.user-dropdown-menu li a {
    display: block;
    padding: 8px 15px;
    color: var(--text);
    text-decoration: none;
    transition: background var(--transition);
}
.user-dropdown-menu li a:hover {
    background: #f5f7fa;
    color: var(--primary);
}
.user-info-item {
    padding: 8px 15px;
    color: var(--text-light);
    font-size: 0.9rem;
}
.user-dropdown-menu hr {
    border: none;
    border-top: 1px solid #eee;
    margin: 5px 0;
}

/* Modal styles */
.auth-modal {
    display: none;
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    align-items: center;
    justify-content: center;
}
.auth-modal.show {
    display: flex;
}
.auth-modal-content {
    background-color: #fff;
    padding: 30px;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
    position: relative;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
.auth-close {
    position: absolute;
    right: 15px;
    top: 10px;
    font-size: 24px;
    cursor: pointer;
    color: #666;
}
.auth-close:hover {
    color: #000;
}
.auth-tabs {
    display: flex;
    border-bottom: 2px solid #eee;
    margin-bottom: 20px;
}
.auth-tab {
    flex: 1;
    background: none;
    border: none;
    padding: 10px;
    font-size: 16px;
    font-weight: 600;
    color: #666;
    cursor: pointer;
    outline: none;
}
.auth-tab.active {
    color: var(--primary);
    border-bottom: 2px solid var(--primary);
}
.auth-form {
    display: none;
}
.auth-form.active {
    display: block;
}
.auth-form .form-group {
    margin-bottom: 15px;
}
.auth-form label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}
.auth-form input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: 'Inter', sans-serif;
}
.auth-form input:focus {
    border-color: var(--primary);
    outline: none;
}
.auth-submit-btn {
    width: 100%;
    padding: 12px;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 10px;
}
.auth-submit-btn:hover {
    background: var(--primary-dark);
}
.auth-error {
    color: red;
    font-size: 14px;
    margin-bottom: 10px;
}
`;

if (!css.includes('.auth-modal')) {
    fs.writeFileSync('styles.css', css + '\n' + authCss);
    console.log("Appended CSS to styles.css");
}
