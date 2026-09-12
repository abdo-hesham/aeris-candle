import { test, expect } from "@playwright/test";
import { enterSite } from "./enter";

test("hero dissolves continuously into the portrait before details begin", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1672, height: 941 });
  await enterSite(page);
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  await page.evaluate(() => window.scrollTo(0, 430));
  const portrait = page.locator(".warm-product-details");
  await expect
    .poll(() =>
      portrait.evaluate((element) => Number(getComputedStyle(element).opacity)),
    )
    .toBeGreaterThan(0.35);
  expect(
    await portrait.evaluate((element) =>
      Number(getComputedStyle(element).opacity),
    ),
  ).toBeLessThan(0.65);
  await expect(page.locator(".warm-product-layer")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "test-results/hero-dissolve.png" });
});

test("hero title hides letter by letter as scroll advances", async ({ page }) => {
  await page.setViewportSize({ width: 1672, height: 941 });
  await enterSite(page);
  const letters = page.locator(".warm-heading-letter");
  await expect(letters).toHaveCount(19);
  await page.evaluate(() => window.scrollTo(0, 180));
  await expect
    .poll(async () => {
      const first = Number(await letters.first().evaluate((element) => getComputedStyle(element).opacity));
      const last = Number(await letters.last().evaluate((element) => getComputedStyle(element).opacity));
      return last - first;
    })
    .toBeGreaterThan(0.5);
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect(letters.last()).toHaveCSS("opacity", "0");
});

test("orbit paints only the arc travelled by the marker, including reverse scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1672, height: 941 });
  await enterSite(page);
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  const stroke = page.locator(".warm-product-details .warm-orbit-progress");
  for (const scroll of [1550, 2090, 2650, 1550]) {
    await page.evaluate((y) => window.scrollTo(0, y), scroll);
    const expectedOffset = Math.max(0, 1 - ((scroll / (941 * 3.6)) * 4.7 - 1.15) / 2.8);
    await expect
      .poll(() =>
        stroke.evaluate((element) =>
          parseFloat(getComputedStyle(element).strokeDashoffset),
        ),
      )
      .toBeCloseTo(expectedOffset, 2);
    await page.screenshot({ path: `test-results/orbit-${scroll}.png` });
  }
});

test("portrait transition keeps candle visible and removes hidden hero link from keyboard navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  await page.mouse.wheel(0, 1300);
  await expect(page.locator(".warm-intro")).toHaveCSS("visibility", "hidden");
  await expect(page.locator(".warm-product-layer")).toHaveCSS("opacity", "1");
  await expect(page.locator(".warm-product-details")).toHaveCSS("opacity", "1");
  await expect(
    page.locator(".warm-product-details .warm-orbit-head"),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/motion-portrait-desktop.png" });
  await page.mouse.wheel(0, -1600);
  await expect(page.locator(".warm-intro")).toHaveCSS("visibility", "visible");
  await expect(page.locator(".warm-product-details")).toHaveCSS("opacity", "0");
});

test("resizing to mobile rebuilds the portrait without duplicate pins", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.mouse.wheel(0, 1800);
  await expect
    .poll(() =>
      page
        .locator(".warm-product-layer")
        .evaluate(
          (element) =>
            element.getBoundingClientRect().width /
            (element as HTMLElement).offsetWidth,
        ),
    )
    .toBeCloseTo(0.82, 2);
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.mouse.wheel(0, 650);
  await expect(
    page.locator(".warm-product-details .warm-orbit-note--three"),
  ).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "test-results/motion-portrait-mobile.png" });
});
