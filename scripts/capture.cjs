const { chromium } = require('@playwright/test');
const fs = require('node:fs');
(async () => {
  fs.mkdirSync('.artifacts/screens', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
  const page = await browser.newPage({ viewport: { width: Number(process.argv[4] || 390), height: Number(process.argv[5] || 844) }, reducedMotion: 'reduce' });
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) console.log(message.type(), message.text()); });
  if (process.argv.includes('--auth')) await require('./mock-session.cjs').mockSession(page);
  await page.goto(`http://localhost:8081${process.argv[2] || '/dev/components'}`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `.artifacts/screens/${process.argv[3] || 'components'}.png`, fullPage: false });
  console.log((await page.locator('body').innerText()).slice(0, 1800));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
