// ===== CUỘN LÊN ĐẦU TRANG =====
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (!scrollTopBtn) return;
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}, { passive: true });

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== LOGO HEADER CỐ ĐỊNH =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (header) {
        if (window.scrollY >= 85) {
            document.body.classList.add('is-sticky');
        } else {
            document.body.classList.remove('is-sticky');
        }
    }
}, { passive: true });

// ===== BẬT/TẮT TÌM KIẾM =====
const searchBtn = document.getElementById('searchBtn');
const searchForm = document.getElementById('searchForm');
const closeSearch = document.getElementById('closeSearch');

if (searchBtn && searchForm) {
    searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchForm.classList.add('active');
        const input = searchForm.querySelector('input');
        if (input) setTimeout(() => input.focus(), 50);
    });

    // Đóng khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (searchForm.classList.contains('active')) {
            if (!searchForm.contains(e.target) && !searchBtn.contains(e.target)) {
                searchForm.classList.remove('active');
            }
        }
    });
}

if (closeSearch && searchForm) {
    closeSearch.addEventListener('click', () => {
        searchForm.classList.remove('active');
    });
}

// ===== MENU ĐIỆN THOẠI =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        document.body.classList.toggle('open-menu');
    });
}

// ===== CHUYỂN TAB TÀI LIỆU =====
const docTabs = document.querySelectorAll('.doc-tab');

docTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabIndex = tab.dataset.tab;

        // Xóa trạng thái active của tất cả các tab
        docTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Hiển thị/ẩn nội dung tab
        document.querySelectorAll('.documents-table').forEach(table => {
            table.classList.add('hidden');
        });

        const targetTable = document.getElementById(`docTab${tabIndex}`);
        if (targetTable) {
            targetTable.classList.remove('hidden');
        }
    });
});

// ===== OBSERVER ĐỂ CHẠY ANIMATION KHI CUỘN =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Theo dõi các phần tử có hiệu ứng animation
document.querySelectorAll('.solution-card, .partner-card, .news-card, .sidebar-banner').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});

// Xử lý đóng mở Accordion (Sidebar)
const accordionHeaders = document.querySelectorAll('.accordion-header');
accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        item.classList.toggle('active');
    });
});

// ===== TÍCH HỢP API (C# BACKEND) =====
const API_BASE = 'http://localhost:5000/api';

async function loadConfig() {
    try {
        const response = await fetch(`${API_BASE}/cau-hinh`);
        if (!response.ok) return;
        const config = await response.json();

        if (config.bannerUrl) {
            const banner = document.querySelector('.header-banner-bg');
            if (banner) {
                banner.style.backgroundImage = `url('${config.bannerUrl}')`;
                banner.style.backgroundSize = 'cover';
                banner.style.backgroundPosition = 'center';
            }
        }
        
        if (config.logoUrl) {
            const logoEl = document.querySelector('.header-content .logo .logo-icon');
            if (logoEl) {
                logoEl.innerHTML = `<img src="${config.logoUrl}" style="max-height: 60px; object-fit: contain;">`;
            }
        }
        
        if (config.headerTextMain) {
            const titleEl = document.querySelector('.header-content .logo-title');
            if (titleEl) {
                titleEl.innerText = config.headerTextMain;
                if (config.headerFontMain) titleEl.style.fontFamily = config.headerFontMain;
            }
        }
        
        if (config.headerTextSub) {
            const subtitleEl = document.querySelector('.header-content .logo-subtitle');
            if (subtitleEl) {
                subtitleEl.innerText = config.headerTextSub;
                if (config.headerFontSub) subtitleEl.style.fontFamily = config.headerFontSub;
            }
        }
        
        if (config.headerTextColor) {
            const titleEl = document.querySelector('.header-content .logo-title');
            const subtitleEl = document.querySelector('.header-content .logo-subtitle');
            if (titleEl) titleEl.style.color = config.headerTextColor;
            if (subtitleEl) subtitleEl.style.color = config.headerTextColor;
        }

        if (config.menuBarBgColor) {
            const navWrapper = document.querySelector('.nav-wrapper');
            if (navWrapper) navWrapper.style.backgroundColor = config.menuBarBgColor;
        }
        
        if (config.welcomeBgColor) {
            const welcomeBanner = document.querySelector('.welcome-banner');
            if (welcomeBanner) {
                welcomeBanner.style.background = config.welcomeBgColor; // Overrides linear-gradient too
            }
        }
        if (config.welcomeTextColor) {
            const welcomeBanner = document.querySelector('.welcome-banner');
            if (welcomeBanner) welcomeBanner.style.color = config.welcomeTextColor;
        }
        if (config.welcomeText) {
            const track = document.querySelector('.welcome-track');
            if (track) {
                const parts = config.welcomeText.split('★').map(p => p.trim());
                let html = '';
                // Duplicate text to create continuous ticker effect
                for (let i = 0; i < 4; i++) {
                    parts.forEach((p, index) => {
                        html += `<span>${p}</span>`;
                        if (index < parts.length - 1) {
                            html += `<span class="star">★</span>`;
                        }
                    });
                    
                    if (i < 3) {
                        if (parts.length > 1) {
                            html += `<span class="star">★</span>`;
                        } else {
                            html += `<span style="display: inline-block; width: 50px;"></span>`;
                        }
                    }
                }
                track.innerHTML = html;
            }
        }

        if (config.newsSectionBgColor) {
            const newsSection = document.getElementById('news-section');
            if (newsSection) newsSection.style.backgroundColor = config.newsSectionBgColor;
        }
        if (config.infoUtilityBgColor) {
            const infoSection = document.getElementById('info-utility-section');
            if (infoSection) infoSection.style.backgroundColor = config.infoUtilityBgColor;
        }
        
        if (config.heroBgColor) {
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) heroSection.style.backgroundColor = config.heroBgColor;
        }

        if (config.heroTitle) {
            const heroTitleEl = document.querySelector('.hero-title');
            if (heroTitleEl) heroTitleEl.innerText = config.heroTitle;
        }

        if (config.heroTitleFont) {
            const heroTitleEl = document.querySelector('.hero-title');
            if (heroTitleEl) heroTitleEl.style.fontFamily = config.heroTitleFont;
        }

        if (config.heroTitleColor) {
            const heroTitleEl = document.querySelector('.hero-title');
            if (heroTitleEl) heroTitleEl.style.color = config.heroTitleColor;
        }

        if (config.heroSubtitle) {
            const heroSubtitleEl = document.querySelector('.hero-description');
            if (heroSubtitleEl) heroSubtitleEl.innerText = config.heroSubtitle;
        }

        if (config.heroSubtitleFont) {
            const heroSubtitleEl = document.querySelector('.hero-description');
            if (heroSubtitleEl) heroSubtitleEl.style.fontFamily = config.heroSubtitleFont;
        }

        if (config.heroSubtitleColor) {
            const heroSubtitleEl = document.querySelector('.hero-description');
            if (heroSubtitleEl) heroSubtitleEl.style.color = config.heroSubtitleColor;
        }

        if (config.heroButtonUrl) {
            const heroButtonEl = document.querySelector('.btn-readmore');
            if (heroButtonEl) heroButtonEl.href = config.heroButtonUrl;
        }

        if (config.heroButtonText) {
            const heroButtonSpan = document.querySelector('.btn-readmore span');
            if (heroButtonSpan) heroButtonSpan.innerText = config.heroButtonText;
        }

        if (config.heroButtonFont) {
            const heroButtonEl = document.querySelector('.btn-readmore');
            if (heroButtonEl) heroButtonEl.style.fontFamily = config.heroButtonFont;
        }

        if (config.heroButtonBgColor) {
            const heroButtonEl = document.querySelector('.btn-readmore');
            if (heroButtonEl) heroButtonEl.style.backgroundColor = config.heroButtonBgColor;
        }
        
        if (config.heroImageUrl) {
            const heroImageContainer = document.querySelector('.hero-image');
            if (heroImageContainer) {
                heroImageContainer.innerHTML = `<img src="${config.heroImageUrl}" style="max-width: 100%; height: auto; border-radius: var(--radius-lg); box-shadow: 0 10px 30px rgba(0,0,0,0.1);">`;
            }
        }
        
        // Ticker logic
        if (config.tickerLabelText) {
            const tickerLabel = document.querySelector('.ticker-label');
            if(tickerLabel) tickerLabel.innerHTML = `<i class="fa-solid fa-bullhorn"></i> ${config.tickerLabelText}`;
        }
        
        if (config.tickerLabelColor) {
            const tickerLabel = document.querySelector('.ticker-label');
            if(tickerLabel) {
                tickerLabel.style.backgroundColor = config.tickerLabelColor;
                let dynamicStyle = document.getElementById('dynamic-ticker-style');
                if(!dynamicStyle) {
                    dynamicStyle = document.createElement('style');
                    dynamicStyle.id = 'dynamic-ticker-style';
                    document.head.appendChild(dynamicStyle);
                }
                dynamicStyle.innerHTML = \`.ticker-label::after { border-left-color: \${config.tickerLabelColor} !important; }\`;
            }
        }

        if (config.tickerItems && Array.isArray(config.tickerItems)) {
            const track = document.querySelector('.ticker-track');
            if(track) {
                let html = '';
                config.tickerItems.forEach(item => {
                    html += `<a href="${item.link}">${item.title}</a><span class="ticker-separator">|</span>`;
                });
                // Duplicate for seamless scrolling
                html += html;
                track.innerHTML = html;
            }
        }

        // Tech Solutions logic
        if (config.techSolutionsItems && Array.isArray(config.techSolutionsItems)) {
            const cards = document.querySelectorAll('.solution-card');
            const font = config.techSolutionsFont;
            const color = config.techSolutionsColor;

            config.techSolutionsItems.forEach((item, index) => {
                if(cards[index]) {
                    const card = cards[index];
                    const h3 = card.querySelector('h3');
                    const p = card.querySelector('p');
                    const a = card.querySelector('a.solution-link');
                    const imgContainer = card.querySelector('.solution-image');
                    
                    if (h3) {
                        h3.innerText = item.title;
                        if (font) h3.style.fontFamily = font;
                        if (color) h3.style.color = color;
                    }
                    if (p) {
                        p.innerText = item.desc;
                        if (font) p.style.fontFamily = font;
                    }
                    if (a) {
                        a.href = item.link;
                        if (color) {
                            a.style.color = color;
                            const svgPath = a.querySelector('svg path');
                            if (svgPath) svgPath.setAttribute('stroke', color);
                        }
                    }
                    if (imgContainer && item.image) {
                        imgContainer.innerHTML = `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`;
                    }
                }
            });
        }
    } catch (e) {
        console.warn('Backend C# is not running. Using default local styles.');
    }
}

async function loadDynamicNews() {
    try {
        const response = await fetch(`${API_BASE}/news`);
        if (!response.ok) return;
        const newsList = await response.json();
        
        const ul = document.getElementById('dynamic-news-list');
        if (ul && newsList && newsList.length > 0) {
            // Giữ 3 mục đầu (hoặc thay thế toàn bộ, thêm vào đầu danh sách)
            let html = '';
            // Chỉ hiển thị 3 tin mới nhất để giữ nguyên bố cục
            const displayList = newsList.slice(0, 3);
            displayList.forEach(item => {
                html += `
                    <li>
                        <a href="#">
                            <span class="news-list-date">${item.date || ''}</span>
                            <span>${item.title || ''}</span>
                        </a>
                    </li>
                `;
            });
            // Có thể thay thế nội dung (innerHTML) hoặc chèn lên đầu
            // Ở đây thay thế danh sách hiện tại bằng danh sách động nếu có tin mới
            ul.innerHTML = html;
        }
    } catch (e) {
        console.warn('Backend C# is not running. Using default static news.');
    }
}

// Khởi tạo khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    loadDynamicNews();
    loadAboutContent();
    loadSupportContent();
    loadHistoryContent();
    loadProductsContent();
    loadOrgChartContent();
    loadStructContent();
    loadCategoryNews();
});

async function loadSupportContent() {
    const titleEl = document.getElementById('dynamic-support-title');
    const contentEl = document.getElementById('dynamic-support-content');
    
    // Chỉ tải nếu đang ở trang Hỗ trợ
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/dau-moi-ho-tro`);
        if (!response.ok) return;
        const support = await response.json();
        
        if (titleEl && support.title) titleEl.innerText = support.title;
        if (contentEl && support.content) contentEl.innerHTML = support.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static support content.');
        if (titleEl) titleEl.innerText = "Đầu mối hỗ trợ trực tuyến qua điện thoại";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadHistoryContent() {
    const titleEl = document.getElementById('dynamic-history-title');
    const contentEl = document.getElementById('dynamic-history-content');
    
    // Chỉ tải nếu đang ở trang Lịch sử
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/lich-su-hinh-thanh`);
        if (!response.ok) return;
        const history = await response.json();
        
        if (titleEl && history.title) titleEl.innerText = history.title;
        if (contentEl && history.content) contentEl.innerHTML = history.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static history content.');
        if (titleEl) titleEl.innerText = "Lịch sử hình thành";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadAboutContent() {
    const titleEl = document.getElementById('dynamic-about-title');
    const contentEl = document.getElementById('dynamic-about-content');
    
    // Chỉ tải nếu đang ở trang Giới thiệu
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/chuc-nang-nhiem-vu`);
        if (!response.ok) return;
        const about = await response.json();
        
        if (titleEl && about.title) titleEl.innerText = about.title;
        if (contentEl && about.content) contentEl.innerHTML = about.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static about content.');
        if (titleEl) titleEl.innerText = "Chức năng, nhiệm vụ";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadProductsContent() {
    const titleEl = document.getElementById('dynamic-products-title');
    const contentEl = document.getElementById('dynamic-products-content');
    
    // Chỉ tải nếu đang ở trang Sản phẩm
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/san-pham-tieu-bieu`);
        if (!response.ok) return;
        const products = await response.json();
        
        if (titleEl && products.title) titleEl.innerText = products.title;
        if (contentEl && products.content) contentEl.innerHTML = products.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static products content.');
        if (titleEl) titleEl.innerText = "Sản phẩm tiêu biểu";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadOrgChartContent() {
    const titleEl = document.getElementById('dynamic-orgchart-title');
    const contentEl = document.getElementById('dynamic-orgchart-content');
    
    // Chỉ tải nếu đang ở trang Sơ đồ tổ chức
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/so-do-to-chuc`);
        if (!response.ok) return;
        const orgchart = await response.json();
        
        if (titleEl && orgchart.title) titleEl.innerText = orgchart.title;
        if (contentEl && orgchart.content) contentEl.innerHTML = orgchart.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static org chart content.');
        if (titleEl) titleEl.innerText = "Sơ đồ tổ chức";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadStructContent() {
    const titleEl = document.getElementById('dynamic-struct-title');
    const contentEl = document.getElementById('dynamic-struct-content');
    
    // Chỉ tải nếu đang ở trang Cơ cấu tổ chức
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/co-cau-to-chuc`);
        if (!response.ok) return;
        const structData = await response.json();
        
        if (titleEl && structData.title) titleEl.innerText = structData.title;
        if (contentEl && structData.content) contentEl.innerHTML = structData.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static struct content.');
        if (titleEl) titleEl.innerText = "Cơ cấu tổ chức";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadCategoryNews() {
    // Lấy ID danh mục từ thuộc tính data-page-id của thẻ body
    const categoryId = document.body.getAttribute('data-page-id');
    if (!categoryId) return; // Nếu không có thì không phải trang tin tức

    // Lấy phần tử hiển thị (hỗ trợ cả id chung và id cũ của bão lũ để tương thích ngược)
    const titleEl = document.getElementById('dynamic-news-title') || document.getElementById('dynamic-baolu-title');
    const contentEl = document.getElementById('dynamic-news-content') || document.getElementById('dynamic-baolu-content');
    
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/${categoryId}`);
        if (!response.ok) return;
        const data = await response.json();
        
        if (titleEl && data.title) titleEl.innerText = data.title;
        if (contentEl) {
            contentEl.innerHTML = '';
            if (!data.posts || data.posts.length === 0) {
                contentEl.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Chưa có bản tin nào.</p>';
                return;
            }
            
            data.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            const grid = document.createElement('div');
            grid.className = 'baolu-grid'; // Vẫn giữ class cũ để dùng chung CSS
            
            data.posts.forEach(post => {
                const card = document.createElement('div');
                card.className = 'baolu-card';
                
                let imageHtml = '';
                if (post.imageUrl) {
                    const imgUrl = post.imageUrl.startsWith('http') ? post.imageUrl : `http://localhost:5000${post.imageUrl}`;
                    imageHtml = `<div class="baolu-img"><img src="${imgUrl}" alt="${post.title}"></div>`;
                }
                
                let linkHtml = '';
                if (post.linkUrl) {
                    linkHtml = `<a href="${post.linkUrl}" target="_blank" class="baolu-link"><i class="fa-solid fa-link"></i> ${post.linkText || 'Xem chi tiết'}</a>`;
                }
                
                card.innerHTML = `
                    ${imageHtml}
                    <div class="baolu-info">
                        <h3 class="baolu-card-title">${post.title}</h3>
                        <div class="baolu-meta">
                            <span><i class="fa-solid fa-clock"></i> ${post.createdAt}</span>
                            ${post.source ? `<span><i class="fa-solid fa-newspaper"></i> ${post.source}</span>` : ''}
                        </div>
                        <div class="baolu-card-content">
                            ${post.content || ''}
                        </div>
                        ${linkHtml}
                    </div>
                `;
                grid.appendChild(card);
            });
            contentEl.appendChild(grid);
        }
    } catch (e) {
        console.warn(`Backend C# is not running. Failed to load ${categoryId}.`, e);
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}
