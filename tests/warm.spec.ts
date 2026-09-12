import { test, expect } from "@playwright/test";
import { enterSite } from "./enter";

test("warm scene layers, parallax and scent keyboard navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1672, height: 941 });
  await enterSite(page);
  await expect(page.locator("h1")).toHaveText("A WARMERKIND OF LUXURY");
  await page
    .locator(".warm-background img")
    .evaluate((image: HTMLImageElement) => image.decode());
  await page
    .locator(".warm-product-layer img")
    .evaluate((image: HTMLImageElement) => image.decode());
  await page.screenshot({ path: "test-results/warm-desktop.png" });
  await page.mouse.wheel(0, 1550);
  await expect
    .poll(() =>
      page
        .locator(".warm-product-layer")
        .evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe("none");
  await expect
    .poll(async () => {
      const bounds = await page.locator(".warm-product-layer").boundingBox();
      return Math.abs(bounds!.x + bounds!.width / 2 - 836);
    })
    .toBeLessThan(3);
  await expect(page.locator(".warm-product-details")).toBeVisible();
  await expect(page.locator(".warm-product-details")).toContainText(
    "120 hours of warmth",
  );
  const points = page.locator(".warm-product-details .warm-orbit-note");
  const dots = page.locator(".warm-product-details .warm-orbit-dot");
  const progress = page.locator(".warm-product-details .warm-orbit-progress");
  await expect(points.nth(0)).toHaveCSS("opacity", "1");
  await expect(points.nth(1)).toHaveCSS("opacity", "0");
  await expect(dots.nth(0)).toHaveCSS("opacity", "1");
  await expect(dots.nth(1)).toHaveCSS("opacity", "0");
  await expect
    .poll(() =>
      dots.evaluateAll((markers) =>
        markers.every((marker) => {
          const x = Number(marker.getAttribute("cx"));
          const y = Number(marker.getAttribute("cy"));
          return Math.abs(Math.hypot(x - 50, y - 50) - 49.8) < 0.01;
        }),
      ),
    )
    .toBe(true);
  let previousDashOffset = await progress.evaluate((element) =>
    Number(getComputedStyle(element).strokeDashoffset.replace("px", "")),
  );
  const initialDashOffset = previousDashOffset;
  const candleWidth = await page
    .locator(".warm-product-layer")
    .evaluate(
      (el) =>
        el.getBoundingClientRect().width / (el as HTMLElement).offsetWidth,
    );
  expect(candleWidth).toBeLessThan(0.8);
  let previousScroll = 1550;
  for (const [scroll, visibleIndex, hiddenIndex] of [
    [2090, 1, 3],
    [2650, 3, 2],
    [3200, 2, -1],
  ]) {
    await page.mouse.wheel(0, scroll - previousScroll);
    previousScroll = scroll;
    await expect(points.nth(visibleIndex)).toHaveCSS("opacity", "1");
    await expect(dots.nth(visibleIndex)).toHaveCSS("opacity", "1");
    if (hiddenIndex >= 0)
      await expect(points.nth(hiddenIndex)).toHaveCSS("opacity", "0");
    if (hiddenIndex >= 0)
      await expect(dots.nth(hiddenIndex)).toHaveCSS("opacity", "0");
    const dashOffset = await progress.evaluate((element) =>
      Number(getComputedStyle(element).strokeDashoffset.replace("px", "")),
    );
    expect(dashOffset).toBeLessThanOrEqual(previousDashOffset);
    previousDashOffset = dashOffset;
  }
  expect(previousDashOffset).toBeLessThan(initialDashOffset);
  await page.screenshot({ path: "test-results/focus-desktop.png" });
  await page.getByRole("button", { name: "Pause scene motion" }).click();
  await expect(page.locator("main")).toHaveClass(/warm-still/);
  await page.locator("#scents").scrollIntoViewIfNeeded();
  await page.getByRole("tab", { name: /Amber/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText("golden heart");
  await page.getByRole("tab", { name: /Amber/ }).press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Cedar/ })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("outdoors");
  expect(errors).toEqual([]);
});

test("mobile reduced motion, quantity and checkout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterSite(page);
  await page
    .locator(".warm-product-layer img")
    .evaluate((image: HTMLImageElement) => image.decode());
  await page.screenshot({ path: "test-results/warm-mobile.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".warm-static-details")).toBeVisible();
  await page.locator("#shop").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "ADD TO BAG" }).click();
  await expect(page.getByRole("dialog")).toContainText("$90.00");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "ADD TO BAG" })).toBeFocused();
  await page.screenshot({ path: "test-results/warm-mobile-shop.png" });
});
