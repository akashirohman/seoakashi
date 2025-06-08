const puppeteer = require('puppeteer');

async function runBot(keyword, targetURL, proxy) {
  const browser = await puppeteer.launch({
  headless: 'new',
    args: [
      `--proxy-server=http://${proxy}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
    timeout: 60000,
  });

  try {
    const page = await browser.newPage();
    await page.goto(targetURL, { timeout: 60000, waitUntil: 'networkidle2' });
    await page.type('input[name="q"]', keyword, { delay: 100 });
    await page.keyboard.press('Enter');
    await page.waitForSelector('#results', { timeout: 30000 });
  } finally {
    await browser.close();
  }
}

module.exports = { runBot };
