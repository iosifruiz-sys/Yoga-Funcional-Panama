import { expect, test } from '@playwright/test';

const pages = [
  { name: 'spanish-homepage', path: '/' },
  { name: 'russian-homepage', path: '/ru/' },
  { name: 'spanish-blog', path: '/blog/' },
  { name: 'russian-blog', path: '/ru/blog/' },
] as const;

for (const pageUnderTest of pages) {
  test(`${pageUnderTest.name} matches its baseline`, async ({ page }) => {
    await page.goto(pageUnderTest.path, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    });

    await expect(page).toHaveScreenshot(`${pageUnderTest.name}.png`, {
      animations: 'disabled',
      fullPage: true,
    });
  });
}
