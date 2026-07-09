const fs = require('fs');

// Patch HTML
let html = fs.readFileSync('quan-tri.html', 'utf8');
html = html.replace('</head>', '    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">\n</head>');
html = html.replace('<script src="quan-tri.js"></script>', '<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>\n<script src="quan-tri.js"></script>');
html = html.replace(/<textarea id="(.*?Content)" style="min-height: 300px;" required placeholder="Nhập nội dung vào đây\.\.\."><\/textarea>/g, '<div id="$1" style="height: 300px; background: #fff; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px;"></div>');
fs.writeFileSync('quan-tri.html', html);

// Patch JS
let js = fs.readFileSync('quan-tri.js', 'utf8');
const keys = ['about', 'support', 'history', 'products', 'orgchart', 'struct', 'baolu'];

keys.forEach(key => {
    // For saving
    const saveRegex = new RegExp(`content: document\\.getElementById\\('${key}Content'\\)\\.value`, 'g');
    js = js.replace(saveRegex, `content: window.editors['${key}'].root.innerHTML`);
    
    // For loading
    const loadRegex = new RegExp(`if\\(${key}Data\\.content\\) document\\.getElementById\\('${key}Content'\\)\\.value = ${key}Data\\.content;`, 'g');
    js = js.replace(loadRegex, `if(${key}Data.content) window.editors['${key}'].root.innerHTML = ${key}Data.content;`);
});

const initCode = `
    window.editors = {};
    const quillOptions = {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ]
        }
    };
    ['about', 'support', 'history', 'products', 'orgchart', 'struct', 'baolu'].forEach(key => {
        window.editors[key] = new Quill('#' + key + 'Content', quillOptions);
    });
`;

js = js.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {" + initCode);
fs.writeFileSync('quan-tri.js', js);
console.log("Patched successfully!");
