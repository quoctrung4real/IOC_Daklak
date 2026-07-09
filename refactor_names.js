const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const renameMap = {
    // Frontend
    'trang-chu.html': 'trang-chu.html',
    'trang-chu.js': 'trang-chu.js',
    'quan-tri.html': 'quan-tri.html',
    'quan-tri.js': 'quan-tri.js',
    'xac-thuc.html': 'xac-thuc.html',
    'xac-thuc.js': 'xac-thuc.js',
    'xac-thuc.css': 'xac-thuc.css',
    'binh-luan.js': 'binh-luan.js',
    'giao-dien.css': 'giao-dien.css',
    
    // Backend (using relative paths for tracking)
    'backend/data/news.json': 'backend/data/tin-tuc.json',
    'backend/data/config.json': 'backend/data/cau-hinh.json',
    'backend/data/users.json': 'backend/data/nguoi-dung.json',
    'backend/data/binh-luan.json': 'backend/data/danh-sach-binh-luan.json'
};

const contentReplaceMap = {
    'trang-chu.html': 'trang-chu.html',
    'trang-chu.js': 'trang-chu.js',
    'quan-tri.html': 'quan-tri.html',
    'quan-tri.js': 'quan-tri.js',
    'xac-thuc.html': 'xac-thuc.html',
    'xac-thuc.js': 'xac-thuc.js',
    'xac-thuc.css': 'xac-thuc.css',
    'binh-luan.js': 'binh-luan.js',
    'giao-dien.css': 'giao-dien.css',
    
    // API endpoints (must be careful not to over-replace, better to match specific strings)
    '"data/tin-tuc.json"': '"data/tin-tuc.json"',
    '"data/cau-hinh.json"': '"data/cau-hinh.json"',
    '"data/nguoi-dung.json"': '"data/nguoi-dung.json"',
    '"data/binh-luan.json"': '"data/danh-sach-binh-luan.json"',
    
    // Routes in C# and JS
    '/api/tin-tuc': '/api/tin-tuc',
    '/api/cau-hinh': '/api/cau-hinh',
    '/api/nguoi-dung': '/api/nguoi-dung',
    '/api/binh-luan': '/api/binh-luan'
};

function gitRename(oldPath, newPath) {
    if (fs.existsSync(oldPath)) {
        console.log(`Renaming: ${oldPath} -> ${newPath}`);
        execSync(`git mv "${oldPath}" "${newPath}"`);
    } else {
        console.log(`Skipping rename: ${oldPath} not found`);
    }
}

// 1. Rename files
Object.keys(renameMap).forEach(oldP => {
    gitRename(oldP, renameMap[oldP]);
});

// 2. Update contents in all files (.html, .js, .cs)
function updateContents(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'bin' && file !== 'obj' && file !== 'wwwroot') {
                updateContents(fullPath);
            }
        } else {
            if (fullPath.endsWith('.html') || fullPath.endsWith('.js') || fullPath.endsWith('.cs') || fullPath.endsWith('.css')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let changed = false;
                
                Object.keys(contentReplaceMap).forEach(key => {
                    if (content.includes(key)) {
                        content = content.split(key).join(contentReplaceMap[key]);
                        changed = true;
                    }
                });
                
                if (changed) {
                    console.log(`Updated content in: ${fullPath}`);
                    fs.writeFileSync(fullPath, content);
                }
            }
        }
    });
}

updateContents('./');
console.log("Refactoring content complete.");
