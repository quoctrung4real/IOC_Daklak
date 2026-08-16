import os

file_path = "user/trang-chu/trang-chu.js"
with open(file_path, "r") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if line.startswith("async function loadCategoryNews() {"):
        start_idx = i
    if start_idx != -1 and line.startswith("// PARTNER LINKS DYNAMIC RENDERING"):
        # The end of the function is right before the partner links section
        end_idx = i - 2
        break

if start_idx != -1 and end_idx != -1:
    new_func = """
let currentNewsPage = 1;
const ITEMS_PER_PAGE = 10;
let isFetchingNews = false;

async function loadCategoryNews(isLoadMore = false) {
    const categoryId = document.body.getAttribute('data-page-id');
    if (!categoryId) return;

    const titleEl = document.getElementById('dynamic-news-title') || document.getElementById('dynamic-baolu-title');
    const contentEl = document.getElementById('dynamic-news-content') || document.getElementById('dynamic-baolu-content');
    
    if (!titleEl && !contentEl) return;
    if (isFetchingNews) return;
    isFetchingNews = true;

    if (!isLoadMore) {
        currentNewsPage = 1;
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="loading-spinner" style="text-align: center; padding: 40px;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 30px; color: var(--primary-color);"></i>
                    <p style="margin-top: 15px; color: #666;">Đang tải tin tức...</p>
                </div>
            `;
        }
    } else {
        const loadMoreBtn = document.getElementById('news-load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tải...';
            loadMoreBtn.disabled = true;
            loadMoreBtn.style.opacity = '0.7';
        }
    }

    try {
        let data = { title: '', posts: [], total: 0 };
        
        if (categoryId === 'tat-ca-tin-tuc') {
            data.title = 'Tất cả tin tức';
            const categories = ['cap-nhat-bao-lu', 'cds-doi-moi-sang-tao', 'chi-dao-dieu-hanh', 'cong-tac-xay-dung-dang', 'giai-phap-an-toan-mang', 'giai-phap-an-toan-thong-tin', 'thong-bao', 'tieu-chuan-chat-luong', 'tin-hoat-dong', 'trao-doi-kinh-nghiem', 'tuong-tac-cong-dan'];
            const promises = categories.map(async cat => {
                try {
                    const res = await fetchWithCache(`${API_BASE}/${cat}?page=${currentNewsPage}&limit=3`); // 3 per category per page for "All news"
                    if (res.ok) {
                        const catData = await res.json();
                        if (catData && catData.posts) {
                            catData.posts.forEach(p => p.categoryId = cat);
                            return catData.posts;
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to fetch ${cat}:`, e);
                }
                return [];
            });
            const results = await Promise.all(promises);
            data.posts = results.flat();
            // Estimate hasMore
            data.total = data.posts.length > 0 ? (currentNewsPage * ITEMS_PER_PAGE) + 1 : 0; 
        } else {
            const response = await fetchWithCache(`${API_BASE}/${categoryId}?page=${currentNewsPage}&limit=${ITEMS_PER_PAGE}`);
            if (!response.ok) { isFetchingNews = false; return; }
            const catData = await response.json();
            if (catData && catData.posts) {
                data.posts = catData.posts;
                data.title = catData.title;
                data.total = catData.total || 9999; // Fallback if no total returned
                data.posts.forEach(p => p.categoryId = categoryId);
            }
        }
        
        if (titleEl && data.title && !isLoadMore) titleEl.innerText = data.title;
        if (contentEl) {
            if (!isLoadMore) contentEl.innerHTML = '';
            else {
                const oldBtnContainer = document.getElementById('news-load-more-container');
                if (oldBtnContainer) oldBtnContainer.remove();
            }

            if (!data.posts || data.posts.length === 0) {
                if (!isLoadMore) contentEl.innerHTML = '<p style="text-align: center; color: #666; font-style: italic; padding: 40px;">Chưa có bản tin nào.</p>';
                isFetchingNews = false;
                return;
            }
            
            data.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            const getExcerpt = (html) => {
                const temp = document.createElement('div');
                temp.innerHTML = html || '';
                const text = temp.textContent || temp.innerText || '';
                return text.length > 150 ? text.substring(0, 150) + '...' : text;
            };

            const renderCard = (post) => {
                const card = document.createElement('a');
                card.className = 'baolu-card fade-in';
                card.style.textDecoration = 'none';
                card.style.color = 'inherit';
                card.style.animation = 'fadeIn 0.5s ease forwards';
                
                let imageHtml = '';
                if (post.imageUrl && post.imageUrl.trim() !== '') {
                    const imgUrl = post.imageUrl.match(/^(http|data:)/) ? post.imageUrl : `http://${window.location.hostname || 'localhost'}:5100${post.imageUrl}`;
                    imageHtml = `<div class="baolu-img"><img src="${resolveBackendUrl(imgUrl)}" loading="lazy" decoding="async" alt="${post.title}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'no-image-placeholder\\'>Không có hình ảnh</div>';"></div>`;
                } else {
                    imageHtml = `<div class="baolu-img"><div class="no-image-placeholder">Không có hình ảnh</div></div>`;
                }
                
                const detailLink = `../../user/tin-tuc/chi-tiet-tin-tuc.html?category=${post.categoryId || categoryId}&id=${post.id}`;
                card.href = detailLink;
                
                let attachmentHtml = '';
                if (post.attachmentUrl) {
                    const attName = post.attachmentName || 'Tài liệu đính kèm';
                    let attUrl = post.attachmentUrl;
                    if (!post.attachmentUrl.match(/^(http|data:)/)) {
                        attUrl = `${API_BASE}/download?file=${encodeURIComponent(post.attachmentUrl)}&name=${encodeURIComponent(attName)}`;
                    }
                    attachmentHtml = `
                        <div style="margin-top: 10px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; gap: 10px;" onclick="event.preventDefault(); window.open('${attUrl}', '_blank');">
                            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
                                <i class="fa-solid fa-file-lines" style="color: #0284c7; font-size: 18px;"></i>
                                <span style="font-size: 14px; font-weight: 500; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${attName}</span>
                            </div>
                            <span style="padding: 5px 10px; background: #0ea5e9; color: white; border-radius: 4px; font-size: 12px; font-weight: 600; white-space: nowrap;">
                                <i class="fa-solid fa-download"></i> Tải về
                            </span>
                        </div>
                    `;
                }
                
                card.innerHTML = `
                    ${imageHtml}
                    <div class="baolu-info">
                        <h3 class="baolu-card-title">${post.title}</h3>
                        <div class="baolu-meta">
                            <span><i class="fa-solid fa-clock"></i> ${post.createdAt}</span>
                            ${post.author ? `<span><i class="fa-solid fa-user"></i> ${post.author}</span>` : ''}
                            ${post.source ? `<span><i class="fa-solid fa-newspaper"></i> ${post.source}</span>` : ''}
                        </div>
                        <div class="baolu-card-content">
                            ${getExcerpt(post.content)}
                        </div>
                        ${attachmentHtml}
                    </div>
                `;
                return card;
            };

            let featuredGrid = document.getElementById('news-featured-grid-container');
            let regularGrid = document.getElementById('news-regular-grid-container');

            if (!isLoadMore) {
                // Feature posts only on page 1
                const featuredPosts = data.posts.filter(p => p.isFeatured).slice(0, 2);
                const regularPosts = data.posts.filter(p => !featuredPosts.includes(p));

                if (featuredPosts.length > 0) {
                    featuredGrid = document.createElement('div');
                    featuredGrid.id = 'news-featured-grid-container';
                    featuredGrid.className = 'news-featured-grid';
                    featuredPosts.forEach(post => {
                        featuredGrid.appendChild(renderCard(post));
                    });
                    contentEl.appendChild(featuredGrid);
                }

                if (regularPosts.length > 0) {
                    regularGrid = document.createElement('div');
                    regularGrid.id = 'news-regular-grid-container';
                    regularGrid.className = 'baolu-grid';
                    regularPosts.forEach(post => {
                        regularGrid.appendChild(renderCard(post));
                    });
                    contentEl.appendChild(regularGrid);
                }
            } else {
                if (regularGrid) {
                    data.posts.forEach(post => {
                        regularGrid.appendChild(renderCard(post));
                    });
                }
            }

            // Check if has more
            const hasMore = categoryId === 'tat-ca-tin-tuc' ? data.posts.length > 0 : (currentNewsPage * ITEMS_PER_PAGE < data.total);

            if (hasMore) {
                const btnContainer = document.createElement('div');
                btnContainer.id = 'news-load-more-container';
                btnContainer.style.textAlign = 'center';
                btnContainer.style.marginTop = '30px';
                btnContainer.style.marginBottom = '20px';
                
                const loadMoreBtn = document.createElement('button');
                loadMoreBtn.id = 'news-load-more-btn';
                loadMoreBtn.className = 'btn-load-more';
                loadMoreBtn.innerHTML = 'Xem thêm <i class="fa-solid fa-chevron-down"></i>';
                loadMoreBtn.style.padding = '12px 30px';
                loadMoreBtn.style.background = 'var(--primary-color)';
                loadMoreBtn.style.color = '#fff';
                loadMoreBtn.style.border = 'none';
                loadMoreBtn.style.borderRadius = '25px';
                loadMoreBtn.style.cursor = 'pointer';
                loadMoreBtn.style.fontWeight = '600';
                loadMoreBtn.style.fontSize = '15px';
                loadMoreBtn.style.transition = 'all 0.3s ease';
                loadMoreBtn.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                
                loadMoreBtn.onmouseover = () => loadMoreBtn.style.transform = 'translateY(-2px)';
                loadMoreBtn.onmouseout = () => loadMoreBtn.style.transform = 'translateY(0)';
                
                // Infinite Scroll using Intersection Observer on the button
                const observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && !isFetchingNews) {
                        observer.disconnect();
                        currentNewsPage++;
                        loadCategoryNews(true);
                    }
                }, { rootMargin: '100px' });
                
                observer.observe(loadMoreBtn);

                loadMoreBtn.addEventListener('click', () => {
                    if (!isFetchingNews) {
                        observer.disconnect();
                        currentNewsPage++;
                        loadCategoryNews(true);
                    }
                });
                
                btnContainer.appendChild(loadMoreBtn);
                contentEl.appendChild(btnContainer);
            }
        }
    } catch (e) {
        console.warn(`Backend C# is not running. Failed to load ${categoryId}.`, e);
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    } finally {
        isFetchingNews = false;
    }
}
"""

    lines = lines[:start_idx] + [new_func + "\n"] + lines[end_idx:]
    with open(file_path, "w") as f:
        f.writelines(lines)
    print("Replaced successfully")
else:
    print(f"Could not find indices. start: {start_idx}, end: {end_idx}")

