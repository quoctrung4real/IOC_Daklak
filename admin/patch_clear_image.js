const fs = require('fs');

// 1. Inject clearImage into quan-tri-v3.js
let js = fs.readFileSync('quan-tri-v3.js', 'utf8');
if (!js.includes('window.clearImage = function')) {
    const clearImageFn = `
window.clearImage = function(urlId, fileId, previewId) {
    if (urlId) {
        const urlEl = document.getElementById(urlId);
        if (urlEl) {
            urlEl.value = '';
            // trigger input event so other apps know
            urlEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
    if (previewId) {
        const previewEl = document.getElementById(previewId);
        if (previewEl) {
            previewEl.style.display = 'none';
            if (previewEl.tagName === 'IMG') previewEl.src = '';
        }
    }
    if (fileId) {
        const fileEl = document.getElementById(fileId);
        if (fileEl) {
            fileEl.value = '';
            const container = fileEl.parentNode;
            if (container) {
                const previews = container.querySelectorAll('.file-name-preview');
                previews.forEach(p => { p.style.display = 'none'; p.innerHTML = ''; });
            }
        }
    }
};
`;
    js = clearImageFn + js;
    fs.writeFileSync('quan-tri-v3.js', js);
}

// 2. Patch quan-tri.html
let html = fs.readFileSync('quan-tri.html', 'utf8');

// Logo
html = html.replace(/onclick="document.getElementById\('logoUrl'\)\.value=''; document.getElementById\('logoPreview'\)\.style\.display='none'; var namePreview = document.getElementById\('logoImage'\)\.nextElementSibling; if\(namePreview && namePreview\.classList\.contains\('file-name-preview'\)\) namePreview\.style\.display='none'; if\(typeof updateHeaderPreview === 'function'\) updateHeaderPreview\(\);"/g, `onclick="clearImage('logoUrl', 'logoImage', 'logoPreview'); if(typeof updateHeaderPreview === 'function') updateHeaderPreview();"`);

// Favicon
html = html.replace(/onclick="document.getElementById\('faviconUrl'\)\.value=''; document.getElementById\('faviconPreview'\)\.style\.display='none'; var namePreview = document.getElementById\('faviconImage'\)\.nextElementSibling; if\(namePreview && namePreview\.classList\.contains\('file-name-preview'\)\) namePreview\.style\.display='none';"/g, `onclick="clearImage('faviconUrl', 'faviconImage', 'faviconPreview');"`);

// Banner
html = html.replace(/onclick="document.getElementById\('bannerUrl'\)\.value=''; if\(typeof updateHeaderPreview === 'function'\) updateHeaderPreview\(\);"/g, `onclick="clearImage('bannerUrl', 'bannerImage'); if(typeof updateHeaderPreview === 'function') updateHeaderPreview();"`);

// Hero Image
html = html.replace(/onclick="document.getElementById\('heroImageUrl'\)\.value=''; if\(typeof updateHeroPreview === 'function'\) updateHeroPreview\(\);"/g, `onclick="clearImage('heroImageUrl', 'heroImage'); if(typeof updateHeroPreview === 'function') updateHeroPreview();"`);

// Info Utility BG
html = html.replace(/onclick="document.getElementById\('iu-group-bgImage'\)\.value=''; showToast\('Đã xóa ảnh nền', 'success'\);"/g, `onclick="clearImage('iu-group-bgImage', 'iu-group-bgImageFile'); showToast('Đã xóa ảnh nền', 'success');"`);

// Info Utility Logo
html = html.replace(/onclick="document.getElementById\('iu-link-logo'\)\.value=''; document.getElementById\('iu-link-logoPreview'\)\.src=''; document.getElementById\('iu-link-logoPreview'\)\.style\.display='none'; showToast\('Đã xóa logo ảnh', 'success'\);"/g, `onclick="clearImage('iu-link-logo', 'iu-link-logoFile', 'iu-link-logoPreview'); showToast('Đã xóa logo ảnh', 'success');"`);

// Footer NCSC
html = html.replace(/onclick="document.getElementById\('footerNcscImageUrl'\)\.value=''"/g, `onclick="clearImage('footerNcscImageUrl', 'footerNcscImage');"`);

// Footer QRCode
html = html.replace(/onclick="document.getElementById\('footerQrCodeUrl'\)\.value=''"/g, `onclick="clearImage('footerQrCodeUrl', 'footerQrCodeImage');"`);

// External Links Logo
html = html.replace(/onclick="document.getElementById\('extLinkLogoUrl'\)\.value=''; document.getElementById\('extLinkLogoPreview'\)\.style\.display='none';"/g, `onclick="clearImage('extLinkLogoUrl', 'extLinkLogoFile', 'extLinkLogoPreview');"`);

// External Links Bg
html = html.replace(/onclick="document.getElementById\('extLinkBgUrl'\)\.value=''; document.getElementById\('extLinkBgPreview'\)\.style\.display='none';"/g, `onclick="clearImage('extLinkBgUrl', 'extLinkBgFile', 'extLinkBgPreview');"`);

// Sidebar Banner Background
html = html.replace(/onclick="document.getElementById\('sb-bgImage'\)\.value=''; sidebarBannersApp\.updatePreview\(\);"/g, `onclick="clearImage('sb-bgImage', 'sb-bgImageFile'); sidebarBannersApp.updatePreview();"`);

fs.writeFileSync('quan-tri.html', html);
console.log('Patched clear image functions in quan-tri.html');
