const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 960 });

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\687d2878-add1-43f3-9004-0a91969f828d';

    console.log('Navigating to /admin (should be stealth 404)...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(artifactDir, 'admin_stealth_404.png') });

    console.log('Typing secret keyword "kiwix"...');
    await page.keyboard.type('kiwix');
    await new Promise(r => setTimeout(r, 600));

    await page.screenshot({ path: path.join(artifactDir, 'admin_unlocked_login.png') });
    console.log('Saved unlocked login screen (clean with no demo details or placeholders)');

    console.log('Logging in with admin credentials...');
    await page.type('input[type="text"]', 'admin');
    await page.type('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, 'admin_dashboard_verified.png') });
    console.log('Saved authenticated admin dashboard!');

    await browser.close();
    console.log('Keyword stealth verification completed!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
