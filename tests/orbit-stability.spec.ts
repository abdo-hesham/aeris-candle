import { test, expect } from "@playwright/test";
import { enterSite } from "./enter";

test("orbit markers stay fixed while the travelling point reveals each note", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  const distance = await page.locator(".pin-spacer").evaluate((el) => el.getBoundingClientRect().height - 900);
  // Sample during each marker's arrival, not only after its animation ends.
  for (const time of [1.96, 2.66, 3.36, 4.06, 2.66, 1.96]) {
    await page.evaluate((y) => scrollTo(0, y), distance * time / 4.7);
    const stroke = page.locator(".warm-product-details .warm-orbit-progress");
    await expect.poll(() => stroke.evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset)))
      .toBeCloseTo(Math.max(0, 1 - (time - 1.15) / 2.8), 2);
    await expect.poll(() => page.locator(".warm-product-details .warm-orbit-dot").evaluateAll((elements) =>
      elements.every((el) => Math.abs(Number(el.getAttribute("r")) - 1.05) < 0.001),
    )).toBe(true);
  }
});
