const JSDOM = require('jsdom').JSDOM;
const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
global.window = dom.window;
global.document = dom.window.document;
global.window.DISABLE_THEME_EFFECTS = false;
global.window.innerWidth = 1920;
global.window.innerHeight = 1080;

require('./user/assets/themes/tet/tet.js');

setTimeout(() => {
    console.log("Flowers count:", document.querySelectorAll('.apricot-flower').length);
    console.log("Fireworks count:", document.querySelectorAll('#fireworks-container').length);
    process.exit(0);
}, 2000);
