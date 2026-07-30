const fs = require('fs');
let html = fs.readFileSync('quan-tri.html', 'utf8');

// The regex matches <div class="config-section-content"...> ... </div>
// But doing it via DOM parser is much safer.
const { JSDOM } = require('jsdom');
const dom = new JSDOM(html);
const document = dom.window.document;

// We only want to add "Lưu cấu hình phần này" button to config sections that don't have it
const configTab = document.getElementById('config-tab');
if (configTab) {
    const contents = configTab.querySelectorAll('.config-section-content');
    contents.forEach(content => {
        // If it doesn't already have a save button at the very end
        const saveBtnHtml = `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: flex-end;">
            <button type="button" class="btn-save-global" onclick="saveAllToServer()"><i class="fa-solid fa-save"></i> Lưu Cấu Hình Phần Này</button>
        </div>`;
        
        // Add to the end of content
        content.insertAdjacentHTML('beforeend', saveBtnHtml);
    });
}

// For 'Gửi phản hồi', 'Hỏi cơ quan nhà nước', etc. text shadow issue, we will also fix trang-chu.js
fs.writeFileSync('quan-tri.html', dom.serialize());
console.log('Patched quan-tri.html');
