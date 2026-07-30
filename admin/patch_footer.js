const fs = require('fs');

let html = fs.readFileSync('quan-tri.html', 'utf8');

// Remove select and label for Kiểu nền Footer
html = html.replace(/<label>Kiểu nền Footer<\/label>[\s\S]*?<\/select>/, '');

// Show both color and gradient
html = html.replace(/id="footerBgColorContainer" style="display: none;/g, 'id="footerBgColorContainer" style="display: block;');

fs.writeFileSync('quan-tri.html', html);
console.log('Patched footer in quan-tri.html');
