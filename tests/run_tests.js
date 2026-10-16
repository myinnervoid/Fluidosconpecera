const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Catch console logs from browser context to see assertion errors
    page.on('console', msg => {
      if (msg.type() === 'error') console.error('Browser Error:', msg.text());
    });

    const fileUrl = "file://" + path.resolve(__dirname, "test_runner.html");
    await page.goto(fileUrl);
    
    // Wait a bit for tests to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await page.evaluate(() => {
      return {
        total: parseInt(document.getElementById("stat-total").innerText, 10),
        pass: parseInt(document.getElementById("stat-pass").innerText, 10),
        fail: parseInt(document.getElementById("stat-fail").innerText, 10)
      };
    });
    
    console.log(`Test Results: ${result.total} total, ${result.pass} passed, ${result.fail} failed.`);
    
    if (result.fail > 0 || result.total === 0) {
      console.error("Tests failed!");
      process.exit(1);
    } else {
      console.log("All tests passed!");
      process.exit(0);
    }
  } catch (err) {
    console.error("Error running tests:", err);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
