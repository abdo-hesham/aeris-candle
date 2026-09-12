import { test, expect } from "@playwright/test";
import { enterSite } from "./enter";

test("scent story flows into purchase with reversible letter headings", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await enterSite(page);
  const heading = page.getByRole("heading", { name: "Warmth, in layers." });
  await expect(heading).toBeAttached();
  await page.locator("#scents").scrollIntoViewIfNeeded();
  const letters = heading.locator(".warm-letter");
  await expect(letters.first()).toHaveCSS("opacity", "1");
  await expect(letters.last()).toHaveCSS("opacity", "1");
  await page.getByRole("tab", { name: "Amber", exact: true }).click();
  await expect(page.locator('[data-scent-image="amber"]')).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(page.getByRole("tabpanel")).toContainText("golden heart");
  await page
    .getByRole("tab", { name: "Amber", exact: true })
    .press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Cedar", exact: true }),
  ).toBeFocused();
  await expect(page.locator('[data-scent-image="cedar"]')).toHaveCSS(
    "opacity",
    "1",
  );
  await page.screenshot({ path: "test-results/editorial-desktop.png" });
  await page.locator("#shop").scrollIntoViewIfNeeded();
  await expect(letters.last()).toHaveCSS("opacity", "0");
  await expect(
    page
      .getByRole("heading", { name: "Make room for a slower evening." })
      .locator(".warm-letter")
      .last(),
  ).toHaveCSS("opacity", "1");
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  await page.screenshot({ path: "test-results/purchase-desktop.png" });
  await page.locator("#scents").scrollIntoViewIfNeeded();
  await expect(letters.last()).toHaveCSS("opacity", "1");
});

test("mobile editorial images load and reduced-motion headings remain readable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#scents");
  await expect(page.locator("#scents .warm-letter").last()).toHaveCSS(
    "opacity",
    "1",
  );
  for (const name of ["Sandalwood", "Amber", "Cedar"]) {
    await page.getByRole("tab", { name, exact: true }).click();
    await page
      .locator(`[data-scent-image="${name.toLowerCase()}"] img`)
      .evaluate((image: HTMLImageElement) => image.decode());
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.screenshot({ path: "test-results/editorial-mobile.png" });
  await page.locator("#shop").scrollIntoViewIfNeeded();
  await page
    .locator(".warm-purchase-image")
    .evaluate((image: HTMLImageElement) => image.decode());
  await page.getByRole("button", { name: "ADD TO BAG" }).click();
  await expect(page.getByRole("dialog")).toContainText("$45.00");
});
