const fs = require('fs');
const path = require('path');

// 1. Create auth.html
const authHtmlContent = `
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
    
            <div class="form-options" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 14px;">
                <label style="display: flex; align-items: center; gap: 5px; font-weight: normal; margin-bottom: 0; cursor: pointer;">
                    <input type="checkbox" id="rememberMe"> Ghi nhớ tài khoản
                </label>
                <a href="#" id="forgotPasswordLink" style="color: var(--primary); text-decoration: none;">Quên mật khẩu?</a>
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
fs.writeFileSync('auth.html', authHtmlContent.trim());

// 2. Extract CSS from styles.css to auth.css
let styles = fs.readFileSync('styles.css', 'utf8');
const startDropdown = styles.indexOf('.user-dropdown-container {');
const endDropdownAndModal = styles.indexOf('.comments-section {'); // The start of the next block

if (startDropdown !== -1 && endDropdownAndModal !== -1) {
    const authCss = styles.substring(startDropdown, endDropdownAndModal);
    fs.writeFileSync('auth.css', authCss.trim());
    
    // Remove from styles.css
    styles = styles.substring(0, startDropdown) + styles.substring(endDropdownAndModal);
    fs.writeFileSync('styles.css', styles);
} else {
    console.log("Could not extract CSS cleanly, indices not found.");
}

// 3. Remove auth HTML from all files
const files = [
    'homepage.html', 'chuc-nang-nhiem-vu.html', 'dau-moi-ho-tro.html',
    'lich-su-hinh-thanh.html', 'san-pham-tieu-bieu.html', 'so-do-to-chuc.html',
    'co-cau-to-chuc.html', 'cap-nhat-bao-lu.html'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    
    // The exact block to remove. Using Regex since spacing might differ slightly
    const authModalRegex = /<!-- ===== AUTH MODAL ===== -->[\s\S]*?<\/div>[\s\n]*<\/div>/;
    
    html = html.replace(authModalRegex, '');
    
    // Wait, the regex might over/under match because of nested divs.
    // Let's do it manually by finding `<!-- ===== AUTH MODAL ===== -->` and then the next `<script`
    const modalStart = html.indexOf('<!-- ===== AUTH MODAL ===== -->');
    if (modalStart !== -1) {
        const scriptStart = html.indexOf('<script', modalStart);
        if (scriptStart !== -1) {
            html = html.substring(0, modalStart) + html.substring(scriptStart);
        }
    }
    
    fs.writeFileSync(file, html);
});

// 4. Update auth.js to load auth.html and auth.css asynchronously
let authJs = fs.readFileSync('auth.js', 'utf8');
const domLoadedString = "document.addEventListener('DOMContentLoaded', () => {";
const domLoadedStart = authJs.indexOf(domLoadedString);

if (domLoadedStart !== -1) {
    const injectedCode = `document.addEventListener('DOMContentLoaded', async () => {
    // Inject auth CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'auth.css';
    document.head.appendChild(link);

    // Inject auth HTML
    try {
        const res = await fetch('auth.html');
        if (res.ok) {
            const html = await res.text();
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            document.body.appendChild(wrapper);
        }
    } catch(e) { console.error("Error loading auth UI:", e); }

`;
    authJs = authJs.replace(domLoadedString, injectedCode);
    fs.writeFileSync('auth.js', authJs);
}

console.log("Refactoring complete");
