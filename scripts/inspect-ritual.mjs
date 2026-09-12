// Walks the pinned story timeline and captures the Section 3 -> Section 4
// handoff at fixed progress marks, so the sequence can be reviewed frame by
// frame instead of by scrubbing.
import { chromium } from "@playwright/test";
import fs from "node:fs";

const url = process.env.AERIS_TEST_URL || "http://127.0.0.1:3100";
const out = process.env.SHOT_DIR || "test-results/ritual";
const width = Number(process.env.W || 1600);
const height = Number(process.env.H || 900);
const marks = (
  process.env.MARKS || "0,0.12,0.25,0.35,0.45,0.55,0.62,0.7,0.75,0.82,0.92,1"
)
  .split(",")
  .map(Number);

// Timeline units, mirrored from motion.ts.
const CHAPTER = 4.45;
const HANDOFF = 3.0;
const SCENT = 3.4;
const RITUAL = 4.2;
const CLOSE = 2.6;
const UNITS = CHAPTER + HANDOFF + SCENT + RITUAL + CLOSE;
const STORY_LENGTH = 14;

fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error") errors.push("console: " + message.text());
});

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForTimeout(1800);

const heroHeight = await page.evaluate(
  () => document.querySelector(".warm-hero").clientHeight,
);
const pinLength = heroHeight * STORY_LENGTH;

for (const mark of marks) {
  const units = CHAPTER + HANDOFF + SCENT + mark * (RITUAL + CLOSE);
  const y = Math.round((units / UNITS) * pinLength);
  await page.evaluate((target) => window.scrollTo(0, target), y);
  await page.waitForTimeout(2200);
  const name = String(mark).replace(".", "_");
  await page.screenshot({ path: `${out}/ritual-${name}.png` });
  console.log("mark", mark, "scrollY", y);
}

// Back up through the same range: the scrub has to reverse on its own.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/ritual-reversed-top.png` });

console.log(
  "pin-spacers:",
  await page.locator(".pin-spacer").count(),
  "triggers:",
  await page.evaluate(
    () => document.querySelectorAll(".pin-spacer, [data-ritual-candle]").length,
  ),
);
console.log("errors:", errors.length ? errors : "none");
await browser.close();
