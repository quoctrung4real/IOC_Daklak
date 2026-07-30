const fs = require('fs');

function patchFile(filePath) {
    let js = fs.readFileSync(filePath, 'utf8');
    
    // Replace the SVG fallback with HTML
    js = js.replace(/<svg viewBox="0 0 280 100".*?<\/svg>/gs, function(match) {
        if (match.includes("Dịch vụ công trực tuyến")) {
            return `<div style="width: 100%; height: 100px; border-radius: 8px; background-color: #0a59ab; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><span style="color: white; font-size: 16px; font-weight: 600; font-family: Inter; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">Dịch vụ công trực tuyến</span></div>`;
        } else if (match.includes("Gửi phản hồi")) {
            return `<div style="width: 100%; height: 100px; border-radius: 8px; background-color: #10b981; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><span style="color: white; font-size: 16px; font-weight: 600; font-family: Inter; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">Gửi phản hồi</span></div>`;
        } else if (match.includes("Hỏi cơ quan nhà nước")) {
            return `<div style="width: 100%; height: 100px; border-radius: 8px; background-color: #f59e0b; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><span style="color: white; font-size: 16px; font-weight: 600; font-family: Inter; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">Hỏi cơ quan nhà nước</span></div>`;
        } else if (match.includes("Tương tác báo chí")) {
            return `<div style="width: 100%; height: 100px; border-radius: 8px; background-color: #8b5cf6; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><span style="color: white; font-size: 16px; font-weight: 600; font-family: Inter; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">Tương tác báo chí</span></div>`;
        } else if (match.includes("Tìm hiểu về chuyển đổi số")) {
            return `<div style="width: 100%; height: 100px; border-radius: 8px; background-color: #ef4444; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><span style="color: white; font-size: 16px; font-weight: 600; font-family: Inter; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">Tìm hiểu về chuyển đổi số</span></div>`;
        }
        return match;
    });

    // Also add dark gradient overlay to banner.bgImage for style-original and style-image-right
    // style-image-right
    js = js.replace(
        /\$\{banner\.bgImage \? `<div style="position: absolute; right: 0; top: 0; bottom: 0; width: 70%; background-image: url\('\\$\{banner\.bgImage\}'\);/g,
        `\$\{banner.bgImage ? \`<div style="position: absolute; right: 0; top: 0; bottom: 0; width: 70%; background-image: linear-gradient(to left, rgba(0,0,0,0.6), transparent), url('\$\{banner.bgImage\}');`
    );
    // style-original
    js = js.replace(
        /\$\{banner\.bgImage \? `<div style="position: absolute; inset: 0; background-image: url\('\\$\{banner\.bgImage\}'\);/g,
        `\$\{banner.bgImage ? \`<div style="position: absolute; inset: 0; background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('\$\{banner.bgImage\}');`
    );

    fs.writeFileSync(filePath, js);
    console.log('Patched ' + filePath);
}

patchFile('user/trang-chu/trang-chu.js');
