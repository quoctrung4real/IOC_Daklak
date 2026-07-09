// ===== SCROLL TO TOP =====
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

// ===== STICKY HEADER LOGO =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (header) {
        if (window.scrollY >= 85) {
            header.classList.add('is-sticky');
        } else {
            header.classList.remove('is-sticky');
        }
    }
}, { passive: true });

// ===== SEARCH TOGGLE =====
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

    // Close on clicking outside
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

// ===== MOBILE MENU =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        document.body.classList.toggle('open-menu');
    });
}

// ===== DOCUMENT TABS =====
const docTabs = document.querySelectorAll('.doc-tab');

docTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabIndex = tab.dataset.tab;

        // Remove active from all tabs
        docTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show/hide tab content
        document.querySelectorAll('.documents-table').forEach(table => {
            table.classList.add('hidden');
        });

        const targetTable = document.getElementById(`docTab${tabIndex}`);
        if (targetTable) {
            targetTable.classList.remove('hidden');
        }
    });
});

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
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

// Observe animated elements
document.querySelectorAll('.solution-card, .partner-card, .news-card, .sidebar-banner').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});

// Sidebar Accordion Logic
const accordionHeaders = document.querySelectorAll('.accordion-header');
accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        item.classList.toggle('active');
    });
});

// ===== API INTEGRATION (C# BACKEND) =====
const API_BASE = 'http://localhost:5000/api';

async function loadDynamicConfig() {
    try {
        const response = await fetch(`${API_BASE}/config`);
        if (!response.ok) return;
        const config = await response.json();
        
        if (config.bodyBgColor) {
            document.body.style.backgroundColor = config.bodyBgColor;
        }
        if (config.bannerUrl) {
            const banner = document.querySelector('.header-banner-bg');
            if (banner) {
                banner.style.backgroundImage = `url('${config.bannerUrl}')`;
                banner.style.backgroundSize = 'cover';
                banner.style.backgroundPosition = 'center';
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
            // Keep the first 3 items (or replace them entirely, let's prepend to the list)
            let html = '';
            // Only show latest 3 for layout consistency
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
            // You can replace innerHTML or just prepend
            // Here we replace the existing list with the dynamic list if there's any dynamic news
            ul.innerHTML = html;
        }
    } catch (e) {
        console.warn('Backend C# is not running. Using default static news.');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDynamicConfig();
    loadDynamicNews();
    loadAboutContent();
    loadSupportContent();
    loadHistoryContent();
    loadProductsContent();
    loadOrgChartContent();
    loadStructContent();
    loadBaoLuContent();
});

async function loadSupportContent() {
    const titleEl = document.getElementById('dynamic-support-title');
    const contentEl = document.getElementById('dynamic-support-content');
    
    // Only fetch if we are on the support page
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
    
    // Only fetch if we are on the history page
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
    
    // Only fetch if we are on the about page
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
    
    // Only fetch if we are on the products page
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
    
    // Only fetch if we are on the orgchart page
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
    
    // Only fetch if we are on the struct page
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

async function loadBaoLuContent() {
    const titleEl = document.getElementById('dynamic-baolu-title');
    const contentEl = document.getElementById('dynamic-baolu-content');
    
    // Only fetch if we are on the baolu page
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/cap-nhat-bao-lu`);
        if (!response.ok) return;
        const baoluData = await response.json();
        
        if (titleEl && baoluData.title) titleEl.innerText = baoluData.title;
        if (contentEl && baoluData.content) contentEl.innerHTML = baoluData.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static baolu content.');
        if (titleEl) titleEl.innerText = "Cập nhật bão lũ";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}
