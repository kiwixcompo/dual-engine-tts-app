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

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\687d2878-add1-43f3-9004-0a91969f828d';
    const mainScreenshot = path.join(artifactDir, 'main_app_screenshot.png');
    await page.screenshot({ path: mainScreenshot, fullPage: false });
    console.log('Saved main app screenshot to:', mainScreenshot);

    console.log('Navigating to http://localhost:3000/admin...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2', timeout: 30000 });
    const adminLoginScreenshot = path.join(artifactDir, 'admin_login_screenshot.png');
    await page.screenshot({ path: adminLoginScreenshot });
    console.log('Saved admin login screenshot to:', adminLoginScreenshot);

    // Fill in admin login
    console.log('Attempting admin login...');
    await page.type('input[type="text"]', 'admin');
    await page.type('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');

    await new Promise(r => setTimeout(r, 1000));
    const adminDashboardScreenshot = path.join(artifactDir, 'admin_dashboard_screenshot.png');
    await page.screenshot({ path: adminDashboardScreenshot });
    console.log('Saved admin dashboard screenshot to:', adminDashboardScreenshot);

    await browser.close();
    console.log('Verification completed successfully!');
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  }
})();
