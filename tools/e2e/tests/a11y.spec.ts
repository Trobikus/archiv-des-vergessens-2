import { expect, test } from "@playwright/test";

test("a11y basis: intro skip + login landmark / labels", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("intro-view")).toBeVisible();

  const skip = page.getByTestId("intro-skip");
  const login = page.getByTestId("login-view");

  await Promise.race([
    skip.waitFor({ state: "visible", timeout: 60_000 }).then(async () => {
      await expect(skip).toBeEnabled();
      await skip.click();
    }),
    login.waitFor({ state: "visible", timeout: 60_000 }),
  ]);

  await expect(login).toBeVisible({ timeout: 30_000 });
  await expect(login).toHaveAttribute("role", "main");
  await expect(login).toHaveAttribute("aria-label", "Login-Portal");

  // Guest path may show realm select; auth form appears when logged out.
  const username = page.getByTestId("auth-username");
  if (await username.isVisible().catch(() => false)) {
    const label = page.locator("label.login-screen__field").first();
    await expect(label).toBeVisible();
  }
});
