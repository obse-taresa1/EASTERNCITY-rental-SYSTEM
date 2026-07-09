const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));
  
  await page.goto('http://localhost:5173/admin-dashboard', {waitUntil: 'networkidle2'});
  
  const content = await page.content();
  console.log('HTML Length:', content.length);
  
  await browser.close();
})();
