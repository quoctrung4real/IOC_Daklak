// quan-tri-y-kien.js
// Logic for "Quản lý Dự thảo" and "Danh sách Góp ý" tabs

let currentDraftOpinions = [];
let currentFeedbacks = [];

document.addEventListener('DOMContentLoaded', () => {
    // Override the setup logic to init our tabs when clicked
    const oldSetupTabs = window.setupTabs;
    if (typeof oldSetupTabs === 'function') {
        const tabs = document.querySelectorAll('.tab-link');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.target;
                if (target === 'draft-opinions-tab') {
                    loadDraftOpinions();
                } else if (target === 'feedbacks-tab') {
                    loadFeedbacks();
                    loadDraftsFilter();
                }
            });
        });
    }

    // Form submit for draft opinion
    document.getElementById('draft-opinion-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('draft-opinion-id').value;
        const number = document.getElementById('draft-opinion-number').value.trim();
        const title = document.getElementById('draft-opinion-title').value.trim();
        const endDate = document.getElementById('draft-opinion-enddate').value;
        const fileInput = document.getElementById('draft-opinion-file');
        
        let fileUrl = null;
        let originalFileName = null;

        if (fileInput.files.length > 0) {
            try {
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    fileUrl = uploadData.url;
                    originalFileName = fileInput.files[0].name;
                } else {
                    showAlert(uploadData.message || 'Lỗi tải file', 'error');
                    return;
                }
            } catch (err) {
                console.error(err);
                showAlert('Lỗi khi tải file đính kèm.', 'error');
                return;
            }
        }

        const payload = {
            documentNumber: number,
            title: title,
            endDate: endDate || null
        };
        
        if (fileUrl) {
            payload.fileUrl = fileUrl;
            payload.originalFileName = originalFileName;
        }

        try {
            const url = id ? `/api/y-kien-du-thao/${id}` : '/api/y-kien-du-thao';
            const method = id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                showAlert(id ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');
                resetDraftOpinionForm();
                loadDraftOpinions();
            } else {
                showAlert(data.message || 'Lỗi hệ thống', 'error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Lỗi khi lưu dự thảo', 'error');
        }
    });

    // Filter feedback
    document.getElementById('feedbacks-draft-filter')?.addEventListener('change', (e) => {
        const draftId = e.target.value;
        renderFeedbacks(draftId);
    });
});

async function loadDraftOpinions() {
    try {
        const res = await fetch('/api/y-kien-du-thao');
        const data = await res.json();
        if (data.success) {
            currentDraftOpinions = data.draftOpinions;
            const tbody = document.querySelector('#draft-opinions-table tbody');
            tbody.innerHTML = '';
            
            if (currentDraftOpinions.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">Chưa có dữ liệu</td></tr>`;
                return;
            }

            currentDraftOpinions.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.documentNumber || ''}</td>
                    <td>${item.title || ''}</td>
                    <td>${item.endDate || ''}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" onclick="editDraftOpinion(${item.id})"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-action btn-delete" onclick="deleteDraftOpinion(${item.id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

function editDraftOpinion(id) {
    const draft = currentDraftOpinions.find(d => d.id === id);
    if (!draft) return;
    
    document.getElementById('draft-opinion-id').value = draft.id;
    document.getElementById('draft-opinion-number').value = draft.documentNumber || '';
    document.getElementById('draft-opinion-title').value = draft.title || '';
    document.getElementById('draft-opinion-enddate').value = draft.endDate ? draft.endDate.substring(0,10) : '';
    
    const fileLink = document.getElementById('draft-opinion-file-link');
    if (draft.fileUrl) {
        fileLink.innerHTML = `<a href="${draft.fileUrl}" target="_blank">${draft.originalFileName || 'File hiện tại'}</a> (Chọn file mới để thay thế)`;
    } else {
        fileLink.innerHTML = '';
    }
}

function resetDraftOpinionForm() {
    document.getElementById('draft-opinion-form').reset();
    document.getElementById('draft-opinion-id').value = '';
    document.getElementById('draft-opinion-file-link').innerHTML = '';
}

function deleteDraftOpinion(id) {
    showConfirm('Bạn có chắc chắn muốn xóa dự thảo này?', async () => {
        try {
            const res = await fetch(`/api/y-kien-du-thao/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                showAlert('Đã xóa dự thảo', 'success');
                loadDraftOpinions();
            } else {
                showAlert(data.message || 'Lỗi khi xóa', 'error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Lỗi hệ thống', 'error');
        }
    });
}

// FEEDBACKS
async function loadFeedbacks() {
    try {
        const res = await fetch('/api/gop-y', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
            currentFeedbacks = data.feedbacks;
            renderFeedbacks();
        }
    } catch (err) {
        console.error(err);
    }
}

function renderFeedbacks(draftId = '') {
    const tbody = document.querySelector('#feedbacks-table tbody');
    tbody.innerHTML = '';
    
    let filtered = currentFeedbacks;
    if (draftId) {
        filtered = currentFeedbacks.filter(f => f.draftOpinionId == draftId);
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">Chưa có góp ý nào</td></tr>`;
        return;
    }

    filtered.forEach(item => {
        const draftTitle = currentDraftOpinions.find(d => d.id === item.draftOpinionId)?.title || `Dự thảo #${item.draftOpinionId}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.id}</td>
            <td title="${draftTitle}">${draftTitle.length > 50 ? draftTitle.substring(0, 50) + '...' : draftTitle}</td>
            <td>${item.fullName || ''}</td>
            <td>${item.email || ''}<br>${item.phoneNumber || ''}</td>
            <td>${item.content || ''}</td>
            <td>${item.createdAt || ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-delete" onclick="deleteFeedback(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadDraftsFilter() {
    try {
        const res = await fetch('/api/y-kien-du-thao');
        const data = await res.json();
        if (data.success) {
            currentDraftOpinions = data.draftOpinions;
            const filter = document.getElementById('feedbacks-draft-filter');
            // reset options
            filter.innerHTML = '<option value="">-- Tất cả dự thảo --</option>';
            data.draftOpinions.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = `[${d.documentNumber || d.id}] ${d.title}`;
                filter.appendChild(opt);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

function deleteFeedback(id) {
    showConfirm('Bạn có chắc chắn muốn xóa góp ý này?', async () => {
        try {
            const res = await fetch(`/api/gop-y/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                showAlert('Đã xóa góp ý', 'success');
                loadFeedbacks();
            } else {
                showAlert(data.message || 'Lỗi khi xóa', 'error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Lỗi hệ thống', 'error');
        }
    });
}
