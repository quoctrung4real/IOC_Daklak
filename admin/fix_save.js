const fs = require('fs');

let js = fs.readFileSync('quan-tri-v3.js', 'utf8');

// We will expose a global function `saveAllToServer` that gathers everything and submits
const globalSaveFunction = `
window.saveAllToServer = async function() {
    let config = {};
    try {
        const res = await apiFetch(\`\${API_BASE}/cau-hinh?t=\${new Date().getTime()}\`);
        if (res.ok) config = await res.json();
    } catch (e) {
        console.warn("Could not fetch current config", e);
    }

    const fields = [
        'headerTextMain', 'headerTextSub', 'headerTextColor', 'headerFontMain', 'headerFontSub',
        'logoUrl', 'faviconUrl', 'bannerUrl', 'menuBarBgColor',
        'welcomeText', 'welcomeBgColor', 'welcomeTextColor',
        'tickerLabelText', 'tickerLabelColor',
        'heroImageUrl', 'heroTitle', 'heroTitleFont', 'heroTitleColor',
        'heroSubtitle', 'heroSubtitleFont', 'heroSubtitleColor', 'heroBgColor', 'heroButtonUrl',
        'heroButtonText', 'heroButtonFont', 'heroButtonBgColor',
        'primaryColor', 'primaryDarkColor', 'accentOrangeColor', 'accentRedColor',
        'bodyBgColor', 'newsSectionBgColor', 'infoUtilityBgColor', 'bgImageUrl', 'footerBgColor',
        'techSolutionsFont', 'techSolutionsColor', 'boKhcnLink', 'ubndLink',
        'csdlVbqpplLink', 'khcnTwLink', 'khcnDpLink', 'vbLuatLink', 'agencyLinksColor'
    ];
    
    fields.forEach(field => {
        const el = document.getElementById(field);
        if(el) {
            config[field] = el.value;
        }
    });
    
    if (typeof tickerItems !== 'undefined') config.tickerItems = tickerItems;
    if (typeof techSolutionsItems !== 'undefined') config.techSolutionsItems = techSolutionsItems;
    if (typeof agencyLinksGroups !== 'undefined') config.agencyLinksGroups = agencyLinksGroups;
    if (typeof featuredNewsSelections !== 'undefined') config.featuredNewsIds = featuredNewsSelections;
    if (typeof externalLinksApp !== 'undefined') config.externalLinks = externalLinksApp.items;

    // Grab App states
    if (typeof sidebarBannersApp !== 'undefined') config.sidebarBanners = sidebarBannersApp.banners;
    if (typeof partnerLinksApp !== 'undefined') config.partnerLinks = partnerLinksApp.items;
    if (typeof infoUtilityApp !== 'undefined') config.infoUtility = infoUtilityApp.items;
    if (typeof multimediaApp !== 'undefined') config.multimedia = multimediaApp.items;

    try {
        const response = await apiFetch(\`\${API_BASE}/cau-hinh\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message || 'Lưu cấu hình thành công!');
        else showAlert('Lỗi lưu cấu hình', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
};
`;

if (!js.includes('window.saveAllToServer = async function')) {
    js += '\n' + globalSaveFunction;
    fs.writeFileSync('quan-tri-v3.js', js);
    console.log('Injected global saveAllToServer');
} else {
    console.log('Already has saveAllToServer');
}
