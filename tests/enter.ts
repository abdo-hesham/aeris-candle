import type { Page } from "@playwright/test";

/**
 * Opens the site and waits for the preloader to leave and the hero entrance to
 * finish, which is the point at which scroll is handed over. Every spec that
 * scrolls or measures the hero has to start here.
 */
export async function enterSite(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForFunction(
    () => document.documentElement.dataset.warmReady === "true",
    undefined,
    { timeout: 60_000 },
  );
}
