document.addEventListener('DOMContentLoaded', async () => {
    // =========================================================
    // TOAST NOTIFICATION
    // =========================================================
    function showToast(message, type = 'success') {
        const oldToast = document.querySelector('.ioc-toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = `ioc-toast ioc-toast-${type}`;

        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '!';

        toast.innerHTML = `
            <span class="ioc-toast-icon">${icon}</span>
            <span class="ioc-toast-message"></span>
            <button type="button" class="ioc-toast-close" aria-label="Đóng thông báo">&times;</button>
        `;

        // Dùng textContent thay vì đưa message trực tiếp vào innerHTML
        // để tránh trường hợp nội dung từ API chứa HTML/script.
        toast.querySelector('.ioc-toast-message').textContent = message;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        const closeToast = () => {
            toast.classList.remove('show');

            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        };

        toast
            .querySelector('.ioc-toast-close')
            .addEventListener('click', closeToast);

        setTimeout(closeToast, 3500);
    }


    // =========================================================
    // CHÈN CSS PHẦN XÁC THỰC
    // =========================================================
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = (window.BASE_URL || '') + 'auth/xac-thuc.css';
    document.head.appendChild(link);


    // =========================================================
    // AUTH MODAL HTML
    // =========================================================
    const authHtml = `
<!-- ===== AUTH MODAL ===== -->
<div class="auth-modal" id="authModal">
    <div class="auth-modal-content">

        <span class="auth-close" id="authClose">&times;</span>

        <div class="auth-tabs">
            <button class="auth-tab active" id="tabLogin">
                Đăng nhập
            </button>

            <button class="auth-tab" id="tabRegister">
                Đăng ký
            </button>
        </div>

        <!-- Login Form -->
        <form id="loginForm" class="auth-form active">

            <div class="form-group">
                <label for="loginUsername">Tên đăng nhập</label>

                <input
                    type="text"
                    id="loginUsername"
                    required
                    placeholder="Nhập tên đăng nhập..."
                >
            </div>

            <div class="form-group">
                <label for="loginPassword">Mật khẩu</label>

                <input
                    type="password"
                    id="loginPassword"
                    required
                    placeholder="Nhập mật khẩu..."
                >
            </div>

            <div
                class="form-options"
                style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 14px;"
            >

                <label
                    style="display: flex; align-items: center; gap: 5px; font-weight: normal; margin-bottom: 0; cursor: pointer;"
                >
                    <input type="checkbox" id="rememberMe">
                    Ghi nhớ tài khoản
                </label>

                <a
                    href="#"
                    id="forgotPasswordLink"
                    style="color: var(--primary-blue); text-decoration: none;"
                >
                    Quên mật khẩu?
                </a>

            </div>

            <p class="auth-error" id="loginError"></p>

            <button
                type="submit"
                class="auth-submit-btn"
            >
                Đăng nhập
            </button>

        </form>


        <!-- Register Form -->
        <form id="registerForm" class="auth-form">

            <div class="form-group">
                <label for="registerUsername">
                    Tên đăng nhập
                </label>

                <input
                    type="text"
                    id="registerUsername"
                    required
                    minlength="3"
                    placeholder="Nhập tên đăng nhập..."
                >
            </div>

            <div class="form-group">
                <label for="registerPassword">
                    Mật khẩu
                </label>

                <input
                    type="password"
                    id="registerPassword"
                    required
                    minlength="6"
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
                >
            </div>

            <p class="auth-error" id="registerError"></p>

            <button
                type="submit"
                class="auth-submit-btn"
            >
                Đăng ký
            </button>

        </form>

    </div>
</div>
`;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = authHtml;
    document.body.appendChild(wrapper);


    // =========================================================
    // LẤY CÁC ELEMENT
    // =========================================================
    const userBtn = document.getElementById('userBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    const authModal = document.getElementById('authModal');
    const authClose = document.getElementById('authClose');

    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    const displayUsername = document.getElementById('displayUsername');
    const logoutBtn = document.getElementById('logoutBtn');
    const userBtnText = document.getElementById('userBtnText');

    const forgotPasswordLink =
        document.getElementById('forgotPasswordLink');


    // =========================================================
    // KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
    // =========================================================
    let currentUser = localStorage.getItem('currentUser');
    let currentFullName = localStorage.getItem('currentFullName');

    if (
        currentUser === 'undefined' ||
        currentUser === 'null'
    ) {
        currentUser = null;
    }

    let currentRole =
        localStorage.getItem('currentUserRole');


    // =========================================================
    // CẬP NHẬT GIAO DIỆN AUTH
    // =========================================================
    function updateAuthUI() {
        if (!userBtnText) return;

        const adminLinkItem =
            document.getElementById('adminLinkItem');

        if (currentUser) {

            const isValidFullName =
                currentFullName &&
                currentFullName !== 'undefined' &&
                currentFullName !== 'null';

            userBtnText.textContent =
                isValidFullName
                    ? currentFullName
                    : currentUser;

            if (displayUsername) {
                displayUsername.textContent =
                    isValidFullName
                        ? currentFullName
                        : currentUser;
            }

            if (adminLinkItem) {
                adminLinkItem.style.display =
                    currentRole === 'Admin'
                        ? 'block'
                        : 'none';
            }

        } else {

            userBtnText.textContent =
                'Đăng nhập';

            if (displayUsername) {
                displayUsername.textContent =
                    'Guest';
            }

            if (adminLinkItem) {
                adminLinkItem.style.display =
                    'none';
            }
        }
    }


    // =========================================================
    // LẮNG NGHE THAY ĐỔI PROFILE
    // =========================================================
    window.addEventListener(
        'authProfileChanged',
        () => {

            currentUser =
                localStorage.getItem('currentUser');

            if (
                currentUser === 'undefined' ||
                currentUser === 'null'
            ) {
                currentUser = null;
            }

            currentFullName =
                localStorage.getItem('currentFullName');

            currentRole =
                localStorage.getItem('currentUserRole');

            updateAuthUI();
        }
    );


    updateAuthUI();


    // =========================================================
    // MỞ LOGIN
    // =========================================================
    if (userBtn) {

        userBtn.addEventListener('click', (e) => {

            e.stopPropagation();

            if (currentUser) {

                // Bật / tắt menu tài khoản
                if (userDropdownMenu) {
                    userDropdownMenu.classList.toggle('show');
                }

                const isValidFullName =
                    currentFullName &&
                    currentFullName !== 'undefined' &&
                    currentFullName !== 'null';

                if (displayUsername) {
                    displayUsername.textContent =
                        isValidFullName
                            ? currentFullName
                            : currentUser;
                }

            } else {

                // Hiển thị popup đăng nhập
                authModal.classList.add('show');
            }
        });

    }


    // =========================================================
    // ĐÓNG MENU KHI CLICK RA NGOÀI
    // =========================================================
    document.addEventListener('click', (e) => {

        if (
            userBtn &&
            userDropdownMenu &&
            !userBtn.contains(e.target) &&
            !userDropdownMenu.contains(e.target)
        ) {
            userDropdownMenu.classList.remove('show');
        }

    });


    // =========================================================
    // ĐÓNG AUTH MODAL
    // =========================================================
    authClose.addEventListener('click', () => {
        authModal.classList.remove('show');
    });


    // =========================================================
    // CHUYỂN TAB ĐĂNG NHẬP / ĐĂNG KÝ
    // =========================================================
    tabLogin.addEventListener('click', () => {

        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');

        loginForm.classList.add('active');
        registerForm.classList.remove('active');

    });


    tabRegister.addEventListener('click', () => {

        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');

        registerForm.classList.add('active');
        loginForm.classList.remove('active');

    });


    // =========================================================
    // ĐĂNG NHẬP
    // =========================================================
    loginForm.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            const username =
                document.getElementById('loginUsername').value;

            const password =
                document.getElementById('loginPassword').value;

            const errorEl =
                document.getElementById('loginError');

            errorEl.textContent = '';


            try {

                const apiBase =
                    (
                        window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === ''
                    )
                        ? `http://${window.location.hostname || 'localhost'}:5100`
                        : 'https://ioc-daklak.onrender.com';


                const res = await fetch(
                    `${apiBase}/api/login`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type': 'application/json'
                        },

                        body: JSON.stringify({
                            username,
                            password
                        })
                    }
                );


                const data = await res.json();


                if (data.success) {

                    localStorage.setItem(
                        'currentUser',
                        data.user.username
                    );


                    if (data.accessToken) {

                        localStorage.setItem(
                            'accessToken',
                            data.accessToken
                        );

                        localStorage.setItem(
                            'tokenType',
                            data.tokenType || 'Bearer'
                        );

                        if (data.expiresAt) {

                            localStorage.setItem(
                                'tokenExpiresAt',
                                data.expiresAt
                            );

                        }
                    }


                    if (data.user.fullName) {

                        localStorage.setItem(
                            'currentFullName',
                            data.user.fullName
                        );

                        currentFullName =
                            data.user.fullName;

                    } else {

                        localStorage.removeItem(
                            'currentFullName'
                        );

                        currentFullName = null;
                    }


                    if (data.user.role) {

                        localStorage.setItem(
                            'currentUserRole',
                            data.user.role
                        );

                        currentRole =
                            data.user.role;

                    } else {

                        localStorage.removeItem(
                            'currentUserRole'
                        );

                        currentRole = null;
                    }


                    currentUser =
                        data.user.username;


                    updateAuthUI();


                    authModal.classList.remove('show');

                    loginForm.reset();


                    // Toast thành công
                    showToast(
                        `Đăng nhập thành công. Chào mừng ${data.user.fullName || data.user.username}!`,
                        'success'
                    );


                    // Gửi sự kiện để các script khác biết
                    // người dùng đã đăng nhập
                    window.dispatchEvent(
                        new Event('userLoginStateChanged')
                    );


                } else {

                    errorEl.textContent =
                        data.message ||
                        'Đăng nhập thất bại.';

                    showToast(
                        data.message ||
                        'Tên đăng nhập hoặc mật khẩu không đúng.',
                        'error'
                    );
                }


            } catch (err) {

                console.error(err);

                errorEl.textContent =
                    'Lỗi kết nối máy chủ.';

                showToast(
                    'Không thể kết nối đến máy chủ.',
                    'error'
                );
            }

        }
    );


    // =========================================================
    // ĐĂNG KÝ
    // =========================================================
    registerForm.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            const username =
                document.getElementById('registerUsername').value;

            const password =
                document.getElementById('registerPassword').value;

            const errorEl =
                document.getElementById('registerError');

            errorEl.textContent = '';


            try {

                const apiBase =
                    (
                        window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === ''
                    )
                        ? `http://${window.location.hostname || 'localhost'}:5100`
                        : 'https://ioc-daklak.onrender.com';


                const res = await fetch(
                    `${apiBase}/api/register`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type': 'application/json'
                        },

                        body: JSON.stringify({
                            username,
                            password
                        })
                    }
                );


                const data = await res.json();


                if (data.success) {

                    localStorage.setItem(
                        'currentUser',
                        data.user.username
                    );


                    if (data.accessToken) {

                        localStorage.setItem(
                            'accessToken',
                            data.accessToken
                        );

                        localStorage.setItem(
                            'tokenType',
                            data.tokenType || 'Bearer'
                        );

                        if (data.expiresAt) {

                            localStorage.setItem(
                                'tokenExpiresAt',
                                data.expiresAt
                            );
                        }
                    }


                    localStorage.removeItem(
                        'currentFullName'
                    );

                    currentFullName = null;


                    if (data.user.role) {

                        localStorage.setItem(
                            'currentUserRole',
                            data.user.role
                        );

                        currentRole =
                            data.user.role;

                    } else {

                        localStorage.removeItem(
                            'currentUserRole'
                        );

                        currentRole = null;
                    }


                    currentUser =
                        data.user.username;


                    updateAuthUI();


                    authModal.classList.remove('show');

                    registerForm.reset();


                    // Toast đăng ký thành công
                    showToast(
                        `Đăng ký thành công. Chào mừng ${data.user.username}!`,
                        'success'
                    );


                    window.dispatchEvent(
                        new Event('userLoginStateChanged')
                    );


                } else {

                    errorEl.textContent =
                        data.message ||
                        'Đăng ký thất bại.';

                    showToast(
                        data.message ||
                        'Đăng ký thất bại.',
                        'error'
                    );
                }


            } catch (err) {

                console.error(err);

                errorEl.textContent =
                    'Lỗi kết nối máy chủ.';

                showToast(
                    'Không thể kết nối đến máy chủ.',
                    'error'
                );
            }

        }
    );


    // =========================================================
    // ĐĂNG XUẤT
    // =========================================================
    if (logoutBtn) {

        logoutBtn.addEventListener('click', (e) => {

            e.preventDefault();

            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentFullName');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('tokenType');
            localStorage.removeItem('tokenExpiresAt');
            localStorage.removeItem('currentUserRole');


            currentUser = null;
            currentFullName = null;
            currentRole = null;


            updateAuthUI();


            if (userDropdownMenu) {
                userDropdownMenu.classList.remove('show');
            }


            // Thông báo đăng xuất
            showToast(
                'Bạn đã đăng xuất khỏi hệ thống.',
                'success'
            );


            window.dispatchEvent(
                new Event('userLoginStateChanged')
            );

        });

    }


    // =========================================================
    // QUÊN MẬT KHẨU
    // =========================================================
    if (forgotPasswordLink) {

        forgotPasswordLink.addEventListener(
            'click',
            (e) => {

                e.preventDefault();

                showToast(
                    'Tính năng khôi phục mật khẩu đang được bảo trì. Vui lòng liên hệ quản trị viên.',
                    'warning'
                );

            }
        );

    }

});