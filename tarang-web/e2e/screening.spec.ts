import { test, expect } from '@playwright/test';

test('should navigate to the screening page and initialize a session', async ({ page }) => {
  // Navigate to the screening page
  await page.goto('/screening');

  // Check the two consent checkboxes
  await page.check('text=I confirm I am the legal guardian and consent to the use of AI for behavioral screening.');
  await page.check('text=I understand the results are for Clinical Support only and do not constitute a diagnosis.');

  // Click the "Initialize Session" button
  await page.click('text=Initialize Session');

  // Wait for the next page to load and verify that it contains the expected text.
  await expect(page.locator('h4:text("Social_Engagement")')).toBeVisible();
});
