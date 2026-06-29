# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/app.spec.ts >> page loads and shows empty state
- Location: e2e/app.spec.ts:11:0

# Error details

```
Error: goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1   | // e2e/app.spec.ts
  2   | import { test, expect } from "@playwright/test";
  3   | 
  4   | test.beforeEach(async ({ page }) => {
  5   |   // Clear localStorage before each test for isolation
> 6   |   await page.goto("/");
      |             ^ Error: goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  7   |   await page.evaluate(() => localStorage.clear());
  8   |   await page.reload();
  9   | });
  10  | 
  11  | test("page loads and shows empty state", async ({ page }) => {
  12  |   await expect(page).toHaveTitle(/Task Manager/);
  13  |   await expect(page.getByTestId("task-list")).toBeVisible();
  14  |   const emptyState = page.locator("#empty-state");
  15  |   await expect(emptyState).toBeVisible();
  16  | });
  17  | 
  18  | test("user can add a task", async ({ page }) => {
  19  |   const input = page.getByTestId("task-manager-form-input");
  20  |   const submitBtn = page.getByTestId("task-manager-form-submit");
  21  | 
  22  |   await input.fill("Write Playwright tests");
  23  |   await submitBtn.click();
  24  | 
  25  |   const taskList = page.getByTestId("task-list");
  26  |   await expect(taskList).toContainText("Write Playwright tests");
  27  |   await expect(input).toHaveValue("");
  28  | });
  29  | 
  30  | test("user cannot add a blank task", async ({ page }) => {
  31  |   const submitBtn = page.getByTestId("task-manager-form-submit");
  32  |   await submitBtn.click();
  33  | 
  34  |   const error = page.locator("#form-error");
  35  |   await expect(error).toBeVisible();
  36  |   await expect(error).toContainText("blank");
  37  |   await expect(page.getByTestId("task-list")).not.toContainText("li");
  38  | });
  39  | 
  40  | test("user can complete a task", async ({ page }) => {
  41  |   const input = page.getByTestId("task-manager-form-input");
  42  |   await input.fill("Complete me");
  43  |   await page.getByTestId("task-manager-form-submit").click();
  44  | 
  45  |   const checkbox = page.getByTestId("task-item-toggle").first();
  46  |   await checkbox.click();
  47  | 
  48  |   const taskItem = page.locator(".task-item").first();
  49  |   await expect(taskItem).toHaveClass(/completed/);
  50  | });
  51  | 
  52  | test("user can delete a task", async ({ page }) => {
  53  |   const input = page.getByTestId("task-manager-form-input");
  54  |   await input.fill("Delete me");
  55  |   await page.getByTestId("task-manager-form-submit").click();
  56  | 
  57  |   await page.getByTestId("task-item-delete").first().click();
  58  | 
  59  |   await expect(page.locator("#empty-state")).toBeVisible();
  60  |   await expect(page.getByTestId("task-list")).not.toContainText("Delete me");
  61  | });
  62  | 
  63  | test("active filter shows only incomplete tasks", async ({ page }) => {
  64  |   const input = page.getByTestId("task-manager-form-input");
  65  | 
  66  |   await input.fill("Active task");
  67  |   await page.getByTestId("task-manager-form-submit").click();
  68  | 
  69  |   await input.fill("Done task");
  70  |   await page.getByTestId("task-manager-form-submit").click();
  71  | 
  72  |   // Complete the second task
  73  |   const checkboxes = page.getByTestId("task-item-toggle");
  74  |   await checkboxes.nth(1).click();
  75  | 
  76  |   // Filter to active only
  77  |   await page.getByTestId("filter-active").click();
  78  | 
  79  |   const items = page.locator(".task-item");
  80  |   await expect(items).toHaveCount(1);
  81  |   await expect(items.first()).toContainText("Active task");
  82  | });
  83  | 
  84  | test("tasks persist after page reload", async ({ page }) => {
  85  |   const input = page.getByTestId("task-manager-form-input");
  86  |   await input.fill("Persistent task");
  87  |   await page.getByTestId("task-manager-form-submit").click();
  88  | 
  89  |   // Verify task is present before reload
  90  |   await expect(page.getByTestId("task-list")).toContainText("Persistent task");
  91  | 
  92  |   // Reload and verify the task is still there
  93  |   await page.reload();
  94  | 
  95  |   await expect(page.getByTestId("task-list")).toContainText("Persistent task");
  96  | });
  97  | 
  98  | test("stats update correctly as tasks are added and completed", async ({
  99  |   page,
  100 | }) => {
  101 |   const input = page.getByTestId("task-manager-form-input");
  102 |   const stats = page.locator("#stats");
  103 | 
  104 |   await input.fill("Task A");
  105 |   await page.getByTestId("task-manager-form-submit").click();
  106 |   await input.fill("Task B");
```