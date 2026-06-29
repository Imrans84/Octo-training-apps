// e2e/app.spec.ts
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Clear localStorage before each test for isolation
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("page loads and shows empty state", async ({ page }) => {
  await expect(page).toHaveTitle(/Task Manager/);
  await expect(page.getByTestId("task-list")).toBeVisible();
  const emptyState = page.locator("#empty-state");
  await expect(emptyState).toBeVisible();
});

test("user can add a task", async ({ page }) => {
  const input = page.getByTestId("task-manager-form-input");
  const submitBtn = page.getByTestId("task-manager-form-submit");

  await input.fill("Write Playwright tests");
  await submitBtn.click();

  const taskList = page.getByTestId("task-list");
  await expect(taskList).toContainText("Write Playwright tests");
  await expect(input).toHaveValue("");
});

test("user cannot add a blank task", async ({ page }) => {
  const submitBtn = page.getByTestId("task-manager-form-submit");
  await submitBtn.click();

  const error = page.locator("#form-error");
  await expect(error).toBeVisible();
  await expect(error).toContainText("blank");
  await expect(page.getByTestId("task-list")).not.toContainText("li");
});

test("user can complete a task", async ({ page }) => {
  const input = page.getByTestId("task-manager-form-input");
  await input.fill("Complete me");
  await page.getByTestId("task-manager-form-submit").click();

  const checkbox = page.getByTestId("task-item-toggle").first();
  await checkbox.click();

  const taskItem = page.locator(".task-item").first();
  await expect(taskItem).toHaveClass(/completed/);
});

test("user can delete a task", async ({ page }) => {
  const input = page.getByTestId("task-manager-form-input");
  await input.fill("Delete me");
  await page.getByTestId("task-manager-form-submit").click();

  await page.getByTestId("task-item-delete").first().click();

  await expect(page.locator("#empty-state")).toBeVisible();
  await expect(page.getByTestId("task-list")).not.toContainText("Delete me");
});

test("active filter shows only incomplete tasks", async ({ page }) => {
  const input = page.getByTestId("task-manager-form-input");

  await input.fill("Active task");
  await page.getByTestId("task-manager-form-submit").click();

  await input.fill("Done task");
  await page.getByTestId("task-manager-form-submit").click();

  // Complete the second task
  const checkboxes = page.getByTestId("task-item-toggle");
  await checkboxes.nth(1).click();

  // Filter to active only
  await page.getByTestId("filter-active").click();

  const items = page.locator(".task-item");
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText("Active task");
});

test("tasks persist after page reload", async ({ page }) => {
  const input = page.getByTestId("task-manager-form-input");
  await input.fill("Persistent task");
  await page.getByTestId("task-manager-form-submit").click();

  // Verify task is present before reload
  await expect(page.getByTestId("task-list")).toContainText("Persistent task");

  // Reload and verify the task is still there
  await page.reload();

  await expect(page.getByTestId("task-list")).toContainText("Persistent task");
});

test("stats update correctly as tasks are added and completed", async ({
  page,
}) => {
  const input = page.getByTestId("task-manager-form-input");
  const stats = page.locator("#stats");

  await input.fill("Task A");
  await page.getByTestId("task-manager-form-submit").click();
  await input.fill("Task B");
  await page.getByTestId("task-manager-form-submit").click();

  await expect(stats).toContainText("2 tasks");
  await expect(stats).toContainText("2 active");

  await page.getByTestId("task-item-toggle").first().click();
  await expect(stats).toContainText("1 active");
  await expect(stats).toContainText("1 done");
});
