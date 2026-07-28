(() => {
const API_BASE = 'http://localhost:5100/api';
const BACKEND_ORIGIN = 'http://localhost:5100';

let documents = [];
let selectedDocument = null;

document.addEventListener('DOMContentLoaded', async () => {
    setupDocumentDetailModal();
    await fetchAndRenderDocuments();
});

async function fetchAndRenderDocuments() {
    const tableBody = document.getElementById('document-table-body');
    if (!tableBody) return;

    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || '';

    const titleMap = {
        'cong-van': 'Công văn',
        'bao-cao': 'Báo cáo',
        'ke-hoach': 'Kế hoạch',
        'quyet-dinh': 'Quyết định',
        'huong-dan': 'Hướng dẫn',
        'chuong-trinh': 'Chương trình',
        'tap-huan': 'Tập huấn'
    };

    if (type && titleMap[type]) {
        const titleEl = document.querySelector('.page-title');
        if (titleEl) titleEl.textContent = titleMap[type].toUpperCase();
        document.title = `${titleMap[type]} - DakLakIOC`;

        const breadcrumbContainer = document.getElementById('breadcrumb-container');
        const level1 = document.getElementById('breadcrumb-level-1');
        if (breadcrumbContainer && level1) {
            level1.innerHTML = `<a href="../../user/van-ban/van-ban.html" style="color: #475569; text-decoration: none;">Văn bản</a>`;
            
            const separator1 = document.createElement('i');
            separator1.className = 'fa-solid fa-caret-right';
            separator1.style.fontSize = '12px';
            separator1.style.color = '#94a3b8';
            
            const level2 = document.createElement('span');
            level2.innerText = 'Văn bản Trung tâm IOC';
            
            const separator2 = document.createElement('i');
            separator2.className = 'fa-solid fa-caret-right';
            separator2.style.fontSize = '12px';
            separator2.style.color = '#94a3b8';
            
            const level3 = document.createElement('span');
            level3.style.color = '#475569';
            level3.innerText = titleMap[type];
            
            breadcrumbContainer.appendChild(separator1);
            breadcrumbContainer.appendChild(level2);
            breadcrumbContainer.appendChild(separator2);
            breadcrumbContainer.appendChild(level3);
        }
    }

    try {
        const apiUrl = type ? `${API_BASE}/van-ban?type=${encodeURIComponent(type)}` : `${API_BASE}/van-ban`;
        const response = await fetch(apiUrl);

        documents = response && response.ok ? await response.json() : [];
        tableBody.innerHTML = '';

        if (!documents || documents.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 30px;">Chưa có văn bản nào.</td>
                </tr>
            `;
            return;
        }

        documents.forEach((doc, index) => {
            const tr = document.createElement('tr');
            const fileLinkHtml = buildDownloadLink(doc);

            tr.innerHTML = `
                <td class="text-center">${index + 1}</td>
                <td>${escapeHtml(doc.documentNumber || '')}</td>
                <td class="text-center">${escapeHtml(doc.publishedAt || '')}</td>
                <td>${escapeHtml(doc.typeName || doc.typeCode || 'Đang cập nhật')}</td>
                <td>
                    <button type="button" class="detail-btn" data-doc-id="${doc.id}">
                        ${escapeHtml(doc.title || '')}
                    </button>
                </td>
                <td class="text-center">${fileLinkHtml}</td>
            `;
            tableBody.appendChild(tr);
        });

        tableBody.querySelectorAll('.detail-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = Number(button.dataset.docId);
                const doc = documents.find(item => item.id === id);
                if (doc) openDocumentDetail(doc);
            });
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 30px; color: red;">Đã xảy ra lỗi khi tải dữ liệu.</td>
            </tr>
        `;
    }
}

function setupDocumentDetailModal() {
    const modal = document.getElementById('docDetailModal');
    const closeButton = document.getElementById('docDetailClose');
    const ttsButton = document.getElementById('docTtsBtn');

    closeButton?.addEventListener('click', closeDocumentDetail);
    modal?.addEventListener('click', event => {
        if (event.target === modal) closeDocumentDetail();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeDocumentDetail();
    });
    ttsButton?.addEventListener('click', readSelectedDocument);
}

function openDocumentDetail(doc) {
    selectedDocument = doc;

    setText('docDetailTitle', doc.title || '');
    setText('docDetailNumber', doc.documentNumber || '');
    setText('docDetailDate', doc.publishedAt || '');
    setText('docDetailType', doc.typeName || doc.typeCode || '');
    setText('docDetailAuthority', doc.issuingAuthority || 'Chưa cập nhật');

    const detailLinkBtn = document.getElementById('docDetailLinkBtn');
    if (detailLinkBtn) {
        detailLinkBtn.href = `chi-tiet.html?id=${doc.id}`;
    }

    const fileEl = document.getElementById('docDetailFile');
    if (fileEl) fileEl.innerHTML = buildDownloadLink(doc);

    const status = document.getElementById('docTtsStatus');
    const audio = document.getElementById('docDetailAudio');
    if (status) status.textContent = '';
    if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.style.display = 'none';
    }

    const modal = document.getElementById('docDetailModal');
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeDocumentDetail() {
    const modal = document.getElementById('docDetailModal');
    const audio = document.getElementById('docDetailAudio');
    if (audio) audio.pause();
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}

async function readSelectedDocument() {
    if (!selectedDocument) return;

    const button = document.getElementById('docTtsBtn');
    const status = document.getElementById('docTtsStatus');
    const audio = document.getElementById('docDetailAudio');
    const buttonText = button?.querySelector('span');
    const text = buildDocumentSpeechText(selectedDocument);

    if (!text) {
        if (status) status.textContent = 'Chưa có nội dung để đọc.';
        return;
    }

    try {
        if (button) button.disabled = true;
        if (buttonText) buttonText.textContent = 'Đang tạo audio...';
        if (status) status.textContent = 'Đang gọi Azure TTS...';

        const response = await fetch(`${API_BASE}/text-to-speech`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ text })
        });
        const result = await response.json();

        if (!response.ok || !result.success || !result.audioUrl) {
            throw new Error(result.message || 'Không tạo được audio.');
        }

        if (audio) {
            audio.src = result.audioUrl.startsWith('http') ? result.audioUrl : `${BACKEND_ORIGIN}${result.audioUrl}`;
            audio.style.display = 'block';
            await audio.play();
        }
        if (status) status.textContent = result.cached ? 'Đang phát audio từ cache.' : 'Đã tạo audio mới.';
    } catch (error) {
        console.error(error);
        if (status) status.textContent = error.message || 'Lỗi TTS.';
    } finally {
        if (button) button.disabled = false;
        if (buttonText) buttonText.textContent = 'Nghe nội dung';
    }
}

function buildDocumentSpeechText(doc) {
    return [
        'Thông tin văn bản.',
        doc.title ? `Trích yếu: ${doc.title}.` : '',
        doc.documentNumber ? `Số ký hiệu: ${doc.documentNumber}.` : '',
        doc.publishedAt ? `Ngày ban hành: ${doc.publishedAt}.` : '',
        doc.typeName ? `Loại văn bản: ${doc.typeName}.` : '',
        doc.issuingAuthority ? `Cơ quan ban hành: ${doc.issuingAuthority}.` : ''
    ].filter(Boolean).join(' ');
}

function buildDownloadLink(doc) {
    if (!doc.fileUrl) {
        return '<span style="color: #999;">Không có file</span>';
    }

    const serverFile = doc.fileUrl.split('/').pop();
    const displayName = doc.originalFileName || serverFile;
    return `<a href="${BACKEND_ORIGIN}/api/download?file=${encodeURIComponent(serverFile)}&name=${encodeURIComponent(displayName)}" target="_blank" class="download-btn"><i class="fa-solid fa-download"></i> Tải tập tin</a>`;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
})();
