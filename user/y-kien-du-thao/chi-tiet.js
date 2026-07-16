document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const draftId = urlParams.get('id');

    if (!draftId) {
        document.getElementById('loading').innerHTML = '<span style="color:red">Không tìm thấy dự thảo.</span>';
        return;
    }

    try {
        const response = await fetch(`/api/y-kien-du-thao/${draftId}`);
        const data = await response.json();
        
        if (data.success && data.draftOpinion) {
            const draft = data.draftOpinion;
            document.getElementById('loading').style.display = 'none';
            document.getElementById('detail-content').style.display = 'block';

            document.getElementById('draft-title').textContent = draft.title || 'Không có tiêu đề';
            document.getElementById('draft-number').textContent = draft.documentNumber || 'Đang cập nhật';
            document.getElementById('draft-date').textContent = draft.createdAt || 'Đang cập nhật';
            document.getElementById('draft-end-date').textContent = draft.endDate || 'Đang cập nhật';
            
            if (draft.fileUrl) {
                document.getElementById('draft-file').innerHTML = `
                    <a href="${draft.fileUrl}" style="color: #0a59ab; font-weight: 500; text-decoration: none;" target="_blank" download>
                        <i class="fas fa-file-download"></i> ${draft.originalFileName || 'Tải file đính kèm'}
                    </a>
                `;
            } else {
                document.getElementById('draft-file').textContent = 'Không có file đính kèm';
            }
        } else {
            document.getElementById('loading').innerHTML = `<span style="color:red">${data.message || 'Không tìm thấy dự thảo.'}</span>`;
        }
    } catch (error) {
        console.error('Error fetching draft detail:', error);
        document.getElementById('loading').innerHTML = '<span style="color:red">Có lỗi xảy ra khi tải dữ liệu.</span>';
    }

    // Handle feedback form
    const form = document.getElementById('feedback-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-submit');
        const alert = document.getElementById('feedback-alert');
        
        const payload = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
            content: document.getElementById('content').value.trim()
        };

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        alert.style.display = 'none';

        try {
            const res = await fetch(`/api/y-kien-du-thao/${draftId}/gop-y`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            
            if (result.success) {
                alert.className = 'alert alert-success';
                alert.innerHTML = '<i class="fas fa-check-circle"></i> Cảm ơn bạn đã gửi ý kiến đóng góp!';
                alert.style.display = 'block';
                form.reset();
            } else {
                throw new Error(result.message || 'Lỗi hệ thống');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert.className = 'alert alert-danger';
            alert.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Lỗi: Không thể gửi ý kiến. Vui lòng thử lại sau.';
            alert.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi góp ý';
        }
    });
});
