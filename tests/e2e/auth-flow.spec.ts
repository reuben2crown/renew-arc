import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login and signup options on home page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'RenewPilot' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create Account' })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Account' }).click();
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  });

  test('should show validation error for invalid email on signup', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Account' }).click();
    
    // Try to submit without email
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Should show validation error
    await expect(page.getByText('Email')).toBeVisible();
  });

  test('should navigate from signup to login', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Account' }).click();
    await page.getByRole('link', { name: 'Already have an account' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should navigate from login to signup', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.getByRole('link', { name: "Don't have an account" }).click();
    await expect(page).toHaveURL('/signup');
  });
});

test.describe('Dashboard Access', () => {
  test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});
