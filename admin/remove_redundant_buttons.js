const fs = require('fs');
let html = fs.readFileSync('quan-tri.html', 'utf8');

html = html.replace(/<button[^>]+onclick="partnerLinksApp\.saveAllToServer\(\)"[^>]*>.*?<\/button>/g, '');
html = html.replace(/<button[^>]+onclick="sidebarBannersApp\.saveAllToServer\(\)"[^>]*>.*?<\/button>/g, '');
html = html.replace(/<button[^>]+onclick="infoUtilityApp\.saveAllToServer\(\)"[^>]*>.*?<\/button>/g, '');
html = html.replace(/<button[^>]+onclick="multimediaApp\.saveAllToServer\(\)"[^>]*>.*?<\/button>/g, '');

fs.writeFileSync('quan-tri.html', html);
console.log('Removed redundant buttons.');
