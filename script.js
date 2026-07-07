// ===== SCROLL TO TOP =====
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== STICKY HEADER =====
const header = document.getElementById('header');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const st = window.scrollY;
    if (st >= 100) {
        header.classList.add('sticky');
        if (st < lastScrollTop) {
            header.classList.add('show');
        } else {
            header.classList.remove('show');
        }
    } else if (st === 0) {
        header.classList.remove('sticky');
        header.classList.remove('show');
    }
    lastScrollTop = st;
}, { passive: true });

// ===== SEARCH TOGGLE =====
const searchBtn = document.getElementById('searchBtn');
const searchForm = document.getElementById('searchForm');
const closeSearch = document.getElementById('closeSearch');

if (searchBtn && searchForm) {
    searchBtn.addEventListener('click', () => {
        searchForm.classList.add('active');
        const input = searchForm.querySelector('input');
        if (input) setTimeout(() => input.focus(), 50);
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
