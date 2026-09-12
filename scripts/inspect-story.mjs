// Walks the whole pinned story at fixed progress marks and writes one frame
// per mark, so the four sections and their three handoffs can be reviewed as
// a sequence instead of by scrubbing. Forward pass, then a reverse pass.
import { chromium } from "@playwright/test";
import fs from "node:fs";

const url = process.env.AERIS_TEST_URL || "http://127.0.0.1:3100";
const out = process.env.SHOT_DIR || "test-results/story";
const width = Number(process.env.W || 1920);
const height = Number(process.env.H || 1022);
const steps = Number(process.env.STEPS || 24);
const STORY_LENGTH = 14;

fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error") errors.push("console: " + message.text());
});

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const heroHeight = await page.evaluate(
  () => document.querySelector(".warm-hero").clientHeight,
);
const pin = heroHeight * STORY_LENGTH;

const capture = async (label, progress) => {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(progress * pin));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/${label}.png`, timeout: 60000 });
};

for (let step = 0; step <= steps; step += 1) {
  await capture(`f${String(step).padStart(2, "0")}`, step / steps);
}
for (let step = steps; step >= 0; step -= 4) {
  await capture(`r${String(step).padStart(2, "0")}`, step / steps);
}

console.log(
  "pin-spacers:",
  await page.locator(".pin-spacer").count(),
  "| errors:",
  errors.length ? errors : "none",
);
await browser.close();
