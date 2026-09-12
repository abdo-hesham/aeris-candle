import { test, expect } from "@playwright/test";
import { enterSite } from "./enter";

test("hero invitation leads into a readable product journey", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  await expect(page.locator(".warm-scroll-cue")).toBeVisible();
  await expect(page.locator(".warm-heading span").first()).toHaveCSS(
    "opacity",
    "1",
  );
  const distance = await page
    .locator(".pin-spacer")
    .evaluate(
      (element) =>
        element.getBoundingClientRect().height -
        document.querySelector(".warm-hero")!.clientHeight,
    );
  expect(distance).toBeCloseTo(900 * 14, 0);
  const units = 4.45 + 3 + 3.4 + 4.2 + 2.6;
  await page.evaluate((y) => scrollTo(0, y), (distance * 2.7) / units);
  await expect(page.locator(".warm-scroll-cue")).toHaveCSS(
    "visibility",
    "hidden",
  );
  const first = page.locator(
    ".warm-product-details .warm-orbit-note--one > span",
  );
  const second = page.locator(
    ".warm-product-details .warm-orbit-note--two > span",
  );
  await expect
    .poll(() => first.evaluate((element) => Number(getComputedStyle(element).opacity)))
    .toBeLessThan(0.85);
  await expect(second).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "test-results/journey-active-note.png" });
  await page.evaluate((y) => scrollTo(0, y), (distance * 4.25) / units);
  await expect(first).toHaveCSS("opacity", "1");
  await page.evaluate(() => document.querySelector("#about")!.scrollIntoView());

  await expect(page.locator(".warm-hero .warm-flame")).toHaveCount(0);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(page.locator(".warm-scroll-cue")).toBeVisible();
  await expect(page.locator(".warm-hero .warm-flame")).toHaveCount(0);
});
