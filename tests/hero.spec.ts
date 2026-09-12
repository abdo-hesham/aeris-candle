import { test, expect } from "@playwright/test";
import { enterSite } from "./enter";

test("local order validates delivery and confirms two candles for $90", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enterSite(page, "/#shop");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "ADD TO BAG" }).click();
  const checkout = page.getByRole("dialog");
  await expect(checkout).toBeVisible();
  await expect(checkout).toContainText("$90.00");
  await checkout.getByRole("button", { name: "CONTINUE TO DELIVERY" }).click();
  await checkout.getByRole("button", { name: "REVIEW ORDER" }).click();
  await expect(checkout.getByLabel("Full name")).toBeVisible();
  await checkout.getByLabel("Full name").fill("Alex Forest");
  await checkout.getByLabel("Email", { exact: true }).fill("alex@example.com");
  await checkout.getByLabel("Street address").fill("12 Garden Street");
  await checkout.getByLabel("City", { exact: true }).fill("Cairo");
  await checkout.getByLabel("Country", { exact: true }).fill("Egypt");
  await checkout.getByRole("button", { name: "REVIEW ORDER" }).click();
  await expect(checkout).toContainText("12 Garden Street");
  await checkout.getByRole("button", { name: "EDIT DETAILS" }).click();
  await expect(checkout.getByLabel("Email", { exact: true })).toHaveValue(
    "alex@example.com",
  );
  await checkout.getByRole("button", { name: "REVIEW ORDER" }).click();
  await checkout.getByRole("button", { name: "PLACE LOCAL ORDER" }).click();
  await expect(checkout).toContainText("Your local order is complete");
  const order = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("aeris-last-order")!),
  );
  expect(order.total).toBe(90);
  expect(order.quantity).toBe(2);
  expect(order.email).toBeUndefined();
  await page.screenshot({ path: "test-results/local-order.png" });
  await checkout
    .getByRole("button", { name: "BACK TO THE COLLECTION" })
    .click();
  await expect(checkout).not.toBeVisible();
  await expect(page.getByRole("button", { name: "ADD TO BAG" })).toBeFocused();
});
