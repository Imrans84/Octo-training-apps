// e2e/app.spec.ts
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Add login information before the website loads.
  // This prevents the Task Manager from redirecting to login.html.
  await page.addInitScript(() => {
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("username", "Sumaira");
    localStorage.setItem("role", "student");
  });

  // Open the Task Manager directly.
  await page.goto("/index.html");

  // Clear task data only.
  // Do not clear the login information.
  await page.evaluate(() => {
    localStorage.removeItem("tasks");
    localStorage.removeItem("task-manager-v1");
  });

  await page.reload();
});

test("page loads and shows empty state", async ({ page }) => {
  await expect(page).toHaveTitle(/Task Manager/);

  // The task list exists but is empty.
  await expect(page.getByTestId("task-list")).toHaveCount(1);
  await expect(page.locator(".task-item")).toHaveCount(0);

  // The empty-state message should be visible.
  const emptyState = page.locator("#empty-state");
  await expect(emptyState).toBeVisible();
});

test("user can add a task", async ({ page }) => {
  const input = page.getByTestId("task-manager-form-input");
  const submitButton = page.getByTestId("task-manager-form-submit");

  await input.fill("Write Playwright tests");
  await submitButton.click();

  const taskList = page.getByTestId("task-list");

  await expect(taskList).toContainText("Write Playwright tests");
  await expect(input).toHaveValue("");
});

test("user cannot add a blank task", async ({ page }) => {
  const submitButton = page.getByTestId("task-manager-form-submit");

  await submitButton.click();

  const error = page.locator("#form-error");

  await expect(error).toBeVisible();
  await expect(error).toContainText("non-empty");
  await expect(page.locator(".task-item")).toHaveCount(0);
});

test("user can complete a task", async ({ page }) => {
  const input = page.getByTestId("task-manager-form-input");

  await input.fill("Complete me");
  await page.getByTestId("task-manager-form-submit").click();

  const checkbox = page.locator('[data-testid^="task-checkbox-"]').first();

  await checkbox.click();

  const taskItem = page.locator(".task-item").first();

  await expect(taskItem).toHaveClass(/task-item--completed/);
});

test("user can delete a task", async ({ page }) => {
  const input = page.getByTestId("task-manager-form-input");

  await input.fill("Delete me");
  await page.getByTestId("task-manager-form-submit").click();

  const deleteButton = page.locator('[data-testid^="task-delete-"]').first();

  await deleteButton.click();

  await expect(page.locator("#empty-state")).toBeVisible();
  await expect(page.locator(".task-item")).toHaveCount(0);
});

test("active filter shows only incomplete tasks", async ({ page }) => {
  const input = page.getByTestId("task-manager-form-input");
  const submitButton = page.getByTestId("task-manager-form-submit");

  await input.fill("Active task");
  await submitButton.click();

  await input.fill("Done task");
  await submitButton.click();

  // Complete the second task.
  const checkboxes = page.locator('[data-testid^="task-checkbox-"]');

  await checkboxes.nth(1).click();

  // Show active tasks only.
  await page.getByTestId("filter-active").click();

  const items = page.locator(".task-item");

  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText("Active task");
  await expect(items.first()).not.toContainText("Done task");
});

test("tasks persist after page reload", async ({ page }) => {
  const input = page.getByTestId("task-manager-form-input");

  await input.fill("Persistent task");
  await page.getByTestId("task-manager-form-submit").click();

  await expect(page.getByTestId("task-list")).toContainText("Persistent task");

  await page.reload();

  await expect(page.getByTestId("task-list")).toContainText("Persistent task");
});

test("stats update correctly as tasks are added and completed", async ({
  page,
}) => {
  const input = page.getByTestId("task-manager-form-input");
  const submitButton = page.getByTestId("task-manager-form-submit");
  const stats = page.locator("#stats");

  await input.fill("Task A");
  await submitButton.click();

  await input.fill("Task B");
  await submitButton.click();

  await expect(stats).toContainText("2 tasks");
  await expect(stats).toContainText("2 active");
  await expect(stats).toContainText("0 done");

  const firstCheckbox = page.locator('[data-testid^="task-checkbox-"]').first();

  await firstCheckbox.click();

  await expect(stats).toContainText("1 active");
  await expect(stats).toContainText("1 done");
});
