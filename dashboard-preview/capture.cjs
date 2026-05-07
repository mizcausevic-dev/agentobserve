const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PREVIEW_DIR = path.resolve(__dirname);
const OUT_DIR = path.resolve(__dirname, '..', 'docs');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { html: 'hero.html', out: 'hero.png', viewport: { width: 1600, height: 1100 } },
  { html: 'workflow.html', out: 'workflow.png', viewport: { width: 1600, height: 1180 } },
  { html: 'proof.html', out: 'proof.png', viewport: { width: 1600, height: 1340 } },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const t of targets) {
    const context = await browser.newContext({
      viewport: t.viewport,
      deviceScaleFactor: 1.5,
    });
    const page = await context.newPage();
    const fileUrl = 'file://' + path.join(PREVIEW_DIR, t.html);
    console.log(`Loading ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const contentHeight = await page.evaluate(() => {
      const body = document.body;
      const last = body.lastElementChild;
      if (!last) return body.scrollHeight;
      const rect = last.getBoundingClientRect();
      return Math.ceil(rect.bottom + 24);
    });
    await page.setViewportSize({ width: t.viewport.width, height: Math.max(contentHeight, 600) });
    await page.waitForTimeout(200);
    const outPath = path.join(OUT_DIR, t.out);
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: t.viewport.width, height: contentHeight },
    });
    console.log(`Saved ${outPath} (h=${contentHeight})`);
    await context.close();
  }
  await browser.close();
})();
