import { expect, test } from "@playwright/test";

test("a11y basis: intro skip + character select landmark", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("intro-view")).toBeVisible();

  const skip = page.getByTestId("intro-skip");
  const charSelect = page.getByTestId("character-select");

  await Promise.race([
    skip.waitFor({ state: "visible", timeout: 60_000 }).then(async () => {
      await expect(skip).toBeEnabled();
      await skip.click();
    }),
    charSelect.waitFor({ state: "visible", timeout: 60_000 }),
  ]);

  await expect(charSelect).toBeVisible({ timeout: 30_000 });
  const main = page.getByRole("main");
  await expect(main).toBeVisible();
  await expect(main).toHaveAttribute("aria-label", /.+/);
});
