const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  const fileUrl = `file://${path.resolve(__dirname, 'tests/test_runner.html')}`;
  await page.goto(fileUrl);
  
  await page.waitForFunction('window.AetheriaTestsComplete === true', { timeout: 10000 }).catch(() => {});
  
  // Also dump stats
  const stats = await page.evaluate(() => {
    return {
      total: document.getElementById('stat-total')?.innerText,
      pass: document.getElementById('stat-pass')?.innerText,
      fail: document.getElementById('stat-fail')?.innerText
    };
  });
  console.log("Test Stats:", stats);
  
  await browser.close();
})();
