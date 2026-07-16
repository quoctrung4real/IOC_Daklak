const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:5100/user/van-ban/van-ban.html', { waitUntil: 'networkidle' });
  console.log('Title:', await page.title());
  await browser.close();
})();
