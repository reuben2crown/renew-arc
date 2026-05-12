import { test, expect } from '@playwright/test';

test.describe('License Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full onboarding flow', async ({ page }) => {
    // Sign up
    await page.click('text=Sign Up');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'SecurePassword123!');
    await page.click('text=Create Account');
    
    await page.waitForURL('/onboarding');
    
    // Add license
    await page.selectOption('[data-testid="license-type"]', 'LCSW');
    await page.selectOption('[data-testid="state"]', 'CA');
    await page.fill('[data-testid="license-number"]', 'LCSW123456');
    await page.fill('[data-testid="renewal-date"]', '2025-12-31');
    await page.fill('[data-testid="ce-hours"]', '36');
    await page.click('text=Save License');
    
    await expect(page.locator('text=License saved')).toBeVisible();
    await page.waitForURL('/dashboard');
    
    // Verify dashboard shows readiness score
    await expect(page.locator('[data-testid="readiness-score"]')).toBeVisible();
  });

  test('should validate required fields in license form', async ({ page }) => {
    await page.click('text=Sign Up');
    await page.fill('[data-testid="email"]', 'test2@example.com');
    await page.fill('[data-testid="password"]', 'SecurePassword123!');
    await page.click('text=Create Account');
    
    await page.waitForURL('/onboarding');
    
    // Try to submit without filling fields
    await page.click('text=Save License');
    
    // Should show validation errors
    await expect(page.locator('text=License type is required')).toBeVisible();
    await expect(page.locator('text=State is required')).toBeVisible();
  });
});

test.describe('CE Upload and OCR Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Assume logged in state for this test
    // In real scenario, would need to login first
  });

  test('should upload certificate and process OCR', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Upload CE Certificate');
    
    // Upload test file
    await page.setInputFiles(
      '[data-testid="certificate-upload"]',
      'tests/fixtures/sample-certificate.pdf'
    );
    
    await page.click('text=Process Certificate');
    
    // Wait for processing
    await expect(page.locator('text=Extracted Information')).toBeVisible({ timeout: 10000 });
    
    // Verify extracted data is shown
    await expect(page.locator('[data-testid="extracted-title"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="confidence-badge"]')).toBeVisible();
    
    // Edit if needed and save
    await page.fill('[data-testid="manual-title"]', 'Updated Course Title');
    await page.click('text=Save CE Credit');
    
    await expect(page.locator('text=CE Credit saved')).toBeVisible();
  });
});

test.describe('Payment Flow', () => {
  test('should initiate checkout process', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('text=Upgrade to Pro');
    
    // Should redirect to Dodo checkout
    await page.waitForURL(/checkout\.dodo\.com/);
    
    expect(page.url()).toContain('dodo.com');
  });
});

test.describe('Reminder System', () => {
  test('should display reminder settings', async ({ page }) => {
    await page.goto('/profile');
    
    await expect(page.locator('text=Email Reminders')).toBeVisible();
    await expect(page.locator('text=SMS Reminders')).toBeVisible();
    
    // Toggle SMS reminders
    await page.check('[data-testid="sms-reminders"]');
    await page.click('text=Save Preferences');
    
    await expect(page.locator('text=Preferences saved')).toBeVisible();
  });
});
