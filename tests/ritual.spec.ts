import { test, expect, type Page } from "@playwright/test";
import { enterSite } from "./enter";

// Timeline units, mirrored from motion.ts. Seven consecutive segments of one
// scrubbed timeline; the last two are the Section 3 -> Section 4 handoff and
// Section 4's own close.
const CHAPTER = 4.45;
const HANDOFF = 3.0;
const SCENT = 3.4;
const RITUAL = 4.2;
const CLOSE = 2.6;
const UNITS = CHAPTER + HANDOFF + SCENT + RITUAL + CLOSE;
const STORY_LENGTH = 14;

// Progress through the handoff (0 to 1 across RITUAL).
const ritualMark = (fraction: number) => (fraction * RITUAL) / (RITUAL + CLOSE);
// Progress through Section 4's own close (0 to 1 across CLOSE).
const closeMark = (fraction: number) =>
  (RITUAL + fraction * CLOSE) / (RITUAL + CLOSE);

// `mark` is progress from the end of the scent story to the end of the pin.
async function scrubTo(page: Page, mark: number) {
  await page.evaluate(
    ([m, chapter, handoff, scent, ritual, close, units, length]) => {
      const hero = document.querySelector(".warm-hero") as HTMLElement;
      const target = Math.round(
        ((chapter + handoff + scent + m * (ritual + close)) / units) *
          hero.clientHeight *
          length,
      );
      window.scrollTo(0, target);
    },
    [mark, CHAPTER, HANDOFF, SCENT, RITUAL, CLOSE, UNITS, STORY_LENGTH],
  );
  await page.waitForTimeout(1700);
}

const shown = (page: Page, selector: string) =>
  page.locator(selector).evaluate((element) => {
    const style = getComputedStyle(element);
    return style.visibility === "hidden" ? 0 : Number(style.opacity);
  });

test("Section 4 assembles room, candle, then notes, in order", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1600, height: 900 });
  await enterSite(page);
  await page.waitForTimeout(1200);

  // Nothing in Section 4 may paint before the handoff asks for it.
  for (const layer of [
    "[data-ritual-room]",
    "[data-ritual-platform]",
    "[data-ritual-candle]",
    "[data-ritual-cta]",
    '[data-ritual-ingredient="cedar"]',
  ]) {
    expect(await shown(page, layer), layer).toBe(0);
  }

  // Cedar holds, and holds alone, at the start of the handoff.
  await scrubTo(page, ritualMark(0.05));
  await expect(page.locator(".scent-layers")).toHaveAttribute(
    "data-active",
    "2",
  );
  expect(await shown(page, "[data-ritual-room]")).toBe(0);
  expect(await shown(page, "[data-ritual-candle]")).toBe(0);

  // The room opens first, and the notes are not in it yet.
  await scrubTo(page, ritualMark(0.24));
  expect(await shown(page, "[data-ritual-room]")).toBeGreaterThan(0);
  expect(
    await shown(page, '[data-ritual-ingredient="sandalwood"]'),
  ).toBe(0);
  expect(await shown(page, '[data-ritual-ingredient="cedar"]')).toBe(0);
  expect(await shown(page, "[data-ritual-linen]")).toBe(0);

  // Then the candle comes down into it, still ahead of every note.
  await scrubTo(page, ritualMark(0.44));
  expect(await shown(page, "[data-ritual-room]")).toBeGreaterThan(0.5);
  expect(await shown(page, "[data-ritual-candle]")).toBeGreaterThan(0.9);
  expect(await shown(page, "[data-ritual-shade]")).toBeGreaterThan(0.5);
  expect(await shown(page, '[data-ritual-ingredient="cedar"]')).toBe(0);

  // The notes land one at a time, and sandalwood is always first.
  await scrubTo(page, ritualMark(0.58));
  expect(
    await shown(page, '[data-ritual-ingredient="sandalwood"]'),
  ).toBeGreaterThan(0.8);
  expect(await shown(page, '[data-ritual-ingredient="cedar"]')).toBeLessThan(
    0.5,
  );

  // The candle arrives unlit, the light has landed behind it, and by the end
  // of the handoff every note is in place.
  await scrubTo(page, ritualMark(0.9));
  expect(await shown(page, "[data-ritual-shade]")).toBe(1);
  expect(await shown(page, "[data-ritual-candle]")).toBeGreaterThan(0.9);
  expect(await shown(page, '[data-ritual-ingredient="cedar"]')).toBeGreaterThan(
    0.8,
  );
  await expect(
    page.locator(".ritual [data-ritual-flame], .ritual .warm-flame"),
  ).toHaveCount(0);

  // The wick stays unlit, and the copy has still not started.
  await scrubTo(page, ritualMark(0.95));
  await expect(
    page.locator(".ritual [data-ritual-flame], .ritual .warm-flame"),
  ).toHaveCount(0);
  await expect(
    page.locator("[data-ritual-warmth], [data-ritual-halo]"),
  ).toHaveCount(0);
  expect(await shown(page, "[data-ritual-cta]")).toBe(0);
  expect(await shown(page, "[data-ritual-intro]")).toBe(0);

  // Section 4's own close: words, then the offer, last of all.
  await scrubTo(page, closeMark(0.34));
  expect(await shown(page, "[data-ritual-intro]")).toBeGreaterThan(0.4);
  expect(await shown(page, "[data-ritual-cta]")).toBe(0);

  await scrubTo(page, closeMark(0.72));
  expect(await shown(page, "[data-ritual-cta]")).toBe(1);
  await expect(page.locator(".ritual-heading")).toHaveAttribute(
    "aria-label",
    "Made for slower evenings.",
  );
  await expect(page.locator("[data-ritual-specs]")).toContainText("230 G");
  await expect(page.locator("[data-ritual-specs]")).toContainText("120 HRS");

  // The footer may not be on screen while Section 4 is still assembling.
  const footerTop = await page
    .locator(".warm-footer")
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(footerTop).toBeGreaterThanOrEqual(900);

  await scrubTo(page, 1);
  const candle = await page.locator("[data-ritual-candle]").boundingBox();
  expect(Math.abs(candle!.x + candle!.width / 2 - 800)).toBeLessThan(8);
  expect(candle!.width).toBeGreaterThan(440);
  const title = await page.locator(".ritual-title").boundingBox();
  expect(title!.y).toBeLessThan(260);
  expect(title!.height).toBeLessThan(120);
  await expect(
    page.getByRole("button", { name: "SHOP", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/ritual-desktop.png" });

  // One pin owns the whole story; nothing else pins.
  await expect(page.locator(".pin-spacer")).toHaveCount(1);

  // The same scrub reverses: Section 4 leaves, Section 3 comes back.
  await scrubTo(page, ritualMark(0.05));
  expect(await shown(page, "[data-ritual-cta]")).toBe(0);
  expect(await shown(page, "[data-ritual-candle]")).toBe(0);
  expect(await shown(page, "[data-ritual-room]")).toBe(0);
  expect(await shown(page, ".scent-layers")).toBe(1);
  await expect(page.locator('[data-scent-row="2"]')).toBeVisible();

  expect(errors).toEqual([]);
});

test("the sunlight is scenery: scroll never changes its exposure", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1022 });
  await enterSite(page);
  await page.waitForTimeout(1200);
  const readings: number[] = [];
  for (const mark of [
    ritualMark(0.6),
    ritualMark(0.85),
    closeMark(0.3),
    closeMark(0.8),
    1,
  ]) {
    await scrubTo(page, mark);
    readings.push(await shown(page, ".ritual-layer--light"));
  }
  // One value, at the exposure the scene was lit at — never scrubbed.
  expect(new Set(readings).size).toBe(1);
  expect(readings[0]).toBeLessThanOrEqual(0.4);
  expect(readings[0]).toBeGreaterThanOrEqual(0.2);

  // And the frame always has a subject: the candle is on screen from the
  // moment Section 3's room starts to go, and the notes join it there.
  for (const fraction of [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]) {
    await scrubTo(page, ritualMark(fraction));
    const anchor = Math.max(
      await shown(page, '[data-ritual-ingredient="sandalwood"]'),
      await shown(page, "[data-ritual-candle]"),
    );
    expect(anchor, `handoff ${fraction} has no focal anchor`).toBeGreaterThan(
      0.6,
    );
  }
  await page.screenshot({ path: "test-results/ritual-wide.png" });
});

test("a reload part-way down rebuilds one pin and no early layers", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1600, height: 900 });
  await enterSite(page);
  await page.waitForTimeout(1000);
  await scrubTo(page, ritualMark(0.05));
  await page.reload();
  await page.waitForTimeout(1800);
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  // Whatever the browser restored the scroll to, Section 4 owns its own
  // state: nothing from it may be showing while cedar still holds.
  await scrubTo(page, ritualMark(0.05));
  expect(await shown(page, "[data-ritual-room]")).toBe(0);
  expect(await shown(page, "[data-ritual-candle]")).toBe(0);

  // A resize re-measures without duplicating the pin.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(1200);
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  await scrubTo(page, 1);
  expect(await shown(page, "[data-ritual-cta]")).toBe(1);
  expect(errors).toEqual([]);
});

test("phones get the sequence, not the still life", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await enterSite(page);
  await page.waitForTimeout(800);
  await page.locator("#shop").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await expect(page.locator("[data-ritual-cta]")).toBeVisible();
  await page.screenshot({ path: "test-results/ritual-mobile.png" });
  await page.getByRole("button", { name: "ADD TO BAG" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(errors).toEqual([]);
});

test("reduced motion shows the finished room without scrolling it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterSite(page);
  await page.waitForTimeout(1000);
  await page.locator("#shop").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  expect(await shown(page, "[data-ritual-candle]")).toBe(1);
  expect(await shown(page, "[data-ritual-cta]")).toBe(1);
  await expect(page.locator(".ritual-heading")).toBeVisible();
  await page.screenshot({ path: "test-results/ritual-reduced.png" });
});
