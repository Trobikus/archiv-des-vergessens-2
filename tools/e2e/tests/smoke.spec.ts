import { expect, test } from "@playwright/test";

test("client smoke: intro → login", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto("/");

  await expect(page).toHaveTitle("Archiv des Vergessens");
  await expect(page.getByTestId("intro-view")).toBeVisible();

  const skip = page.getByTestId("intro-skip");
  const login = page.getByTestId("login-view");

  // Boot may finish before the full intro: skip appears. Or intro auto-exits to login.
  await Promise.race([
    skip.waitFor({ state: "visible", timeout: 60_000 }).then(async () => {
      await skip.click();
    }),
    login.waitFor({ state: "visible", timeout: 60_000 }),
  ]);

  await expect(login).toBeVisible({ timeout: 30_000 });
  expect(pageErrors).toEqual([]);
});
