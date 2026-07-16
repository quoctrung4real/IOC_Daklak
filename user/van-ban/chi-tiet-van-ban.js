(function() {
const API_BASE = 'http://localhost:5100/api';
const BACKEND_ORIGIN = 'http://localhost:5100';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        document.getElementById('detail-title').innerText = 'Không tìm thấy văn bản';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/van-ban/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        if (!data.success || !data.document) {
            document.getElementById('detail-title').innerText = 'Văn bản không tồn tại hoặc đã bị xóa';
            return;
        }

        const doc = data.document;

        // Helper to format date
        const formatDate = (dateString) => {
            if (!dateString) return 'Đang cập nhật';
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return dateString;
                return date.toLocaleDateString('vi-VN');
            } catch (e) {
                return dateString;
            }
        };

        document.getElementById('detail-title').innerText = doc.title || 'Đang cập nhật';
        document.getElementById('detail-summary').innerText = doc.title || 'Đang cập nhật';
        document.getElementById('detail-number').innerText = doc.documentNumber || 'Đang cập nhật';
        document.getElementById('detail-published-at').innerText = formatDate(doc.publishedAt);
        document.getElementById('detail-effective-date').innerText = formatDate(doc.effectiveDate);
        document.getElementById('detail-domain').innerText = doc.domain || 'Đang cập nhật';
        document.getElementById('detail-type').innerText = doc.typeName || doc.typeCode || 'Đang cập nhật';
        document.getElementById('detail-authority').innerText = doc.issuingAuthority || 'Đang cập nhật';
        document.getElementById('detail-signer').innerText = doc.signer || 'Đang cập nhật';

        const fileAction = document.getElementById('detail-file-action');
        if (doc.fileUrl) {
            let serverFile = doc.fileUrl.split('/').pop();
            let displayName = doc.originalFileName || serverFile;
            fileAction.innerHTML = `<a href="${API_BASE}/download?file=${encodeURIComponent(serverFile)}&name=${encodeURIComponent(displayName)}" class="doc-btn doc-btn-primary" target="_blank" style="text-decoration: none; padding: 8px 16px; font-size: 14px;">
                <i class="fa-solid fa-download"></i>
                Tải văn bản
            </a>`;
        } else {
            fileAction.innerHTML = '<span style="color: #64748b; font-style: italic; display: flex; align-items: center; height: 100%;">Không có file đính kèm</span>';
        }

        // Setup TTS
        const ttsBtn = document.getElementById('docTtsBtn');
        ttsBtn.addEventListener('click', async () => {
            const text = [
                doc.title || '',
                doc.documentNumber ? `Số ký hiệu: ${doc.documentNumber}` : '',
                doc.publishedAt ? `Ngày ban hành: ${doc.publishedAt}` : '',
                doc.issuingAuthority ? `Cơ quan ban hành: ${doc.issuingAuthority}` : ''
            ].filter(t => t.trim().length > 0).join('. ');

            const status = document.getElementById('docTtsStatus');
            const audio = document.getElementById('docDetailAudio');

            if (!text) {
                status.textContent = 'Chưa có nội dung để đọc.';
                return;
            }

            try {
                ttsBtn.disabled = true;
                ttsBtn.querySelector('span').textContent = 'Đang tạo audio...';
                status.textContent = 'Đang gọi Azure TTS...';

                const ttsResponse = await fetch(`${API_BASE}/text-to-speech`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });

                if (!ttsResponse.ok) {
                    throw new Error('API lỗi: ' + ttsResponse.statusText);
                }

                const blob = await ttsResponse.blob();
                const url = URL.createObjectURL(blob);
                audio.src = url;
                audio.style.display = 'block';
                await audio.play();
                status.textContent = 'Đang phát...';
            } catch (error) {
                console.error(error);
                status.textContent = 'Lỗi tạo audio.';
            } finally {
                ttsBtn.disabled = false;
                ttsBtn.querySelector('span').textContent = 'Nghe nội dung';
            }
        });

        // Tải các văn bản cùng thể loại
        if (doc.typeCode) {
            try {
                const relatedResponse = await fetch(`${API_BASE}/van-ban?type=${encodeURIComponent(doc.typeCode)}`);
                if (relatedResponse.ok) {
                    const relatedDocs = await relatedResponse.json();
                    
                    // Lọc bỏ văn bản hiện tại và lấy tối đa 5 văn bản
                    const filteredDocs = relatedDocs.filter(d => d.id != id).slice(0, 5);
                    
                    if (filteredDocs.length > 0) {
                        const container = document.getElementById('related-docs-container');
                        if (container) container.style.display = 'block';
                        
                        const listContainer = document.getElementById('related-docs-list');
                        if (listContainer) {
                            filteredDocs.forEach(d => {
                                const item = document.createElement('a');
                                item.href = `chi-tiet.html?id=${d.id}`;
                                item.style.cssText = 'display: block; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.2s;';
                                item.onmouseover = () => item.style.borderColor = '#0a59ab';
                                item.onmouseout = () => item.style.borderColor = '#e2e8f0';
                                
                                const dateStr = d.publishedAt ? new Date(d.publishedAt).toLocaleDateString('vi-VN') : 'Đang cập nhật';
                                item.innerHTML = `
                                    <div style="font-weight: 600; color: #0a59ab; margin-bottom: 8px; font-size: 15px; line-height: 1.4;">${d.title || d.documentNumber || 'Văn bản chưa có tiêu đề'}</div>
                                    <div style="font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 15px;">
                                        <span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
                                        <span><i class="fa-solid fa-building"></i> ${d.issuingAuthority || 'Đang cập nhật'}</span>
                                    </div>
                                `;
                                listContainer.appendChild(item);
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('Lỗi tải văn bản liên quan:', err);
            }
        }

    } catch (e) {
        console.error(e);
        document.getElementById('detail-title').innerText = 'Lỗi kết nối hoặc tải dữ liệu';
    }
});
})();
