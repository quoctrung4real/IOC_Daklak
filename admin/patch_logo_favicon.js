const fs = require('fs');

let html = fs.readFileSync('quan-tri.html', 'utf8');

// Logo
html = html.replace(/onclick="document\.getElementById\('logoUrl'\)\.value=''; document\.getElementById\('logoPreview'\)\.style\.display='none'; var namePreview = document\.getElementById\('logoImage'\)\.nextElementSibling; if\(namePreview \&amp;\&amp; namePreview\.classList\.contains\('file-name-preview'\)\) namePreview\.style\.display='none'; if\(typeof updateHeaderPreview === 'function'\) updateHeaderPreview\(\);"/g, `onclick="clearImage('logoUrl', 'logoImage', 'logoPreview'); if(typeof updateHeaderPreview === 'function') updateHeaderPreview();"`);

// Favicon
html = html.replace(/onclick="document\.getElementById\('faviconUrl'\)\.value=''; document\.getElementById\('faviconPreview'\)\.style\.display='none'; var namePreview = document\.getElementById\('faviconImage'\)\.nextElementSibling; if\(namePreview \&amp;\&amp; namePreview\.classList\.contains\('file-name-preview'\)\) namePreview\.style\.display='none';"/g, `onclick="clearImage('faviconUrl', 'faviconImage', 'faviconPreview');"`);

fs.writeFileSync('quan-tri.html', html);
console.log('Patched logo and favicon');
