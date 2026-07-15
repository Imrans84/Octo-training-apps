// src/main.js
// Orchestrator: connects services, components, storage, DOM, and events.

// Protect the Task Manager page.
if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "login.html";
}

// Business logic
import {
  createTask,
  updateTask,
  deleteTask,
  filterTasks,
  getStats,
} from "./services/task-service.js";

// Book search services
import { searchBooks } from "./services/book-search-service.js";

// Component rendering
import { renderTaskItem } from "./components/task-item.js";
import { renderSearchResults } from "./components/search-results.js";

// Utilities
import storage from "./utils/storage.js";
import { escapeHtml } from "./utils/dom.js";

// Existing keyboard accessibility file is outside src.
import {
  initFilterKeyboardNav,
  moveFocusAfterDelete,
  announceToScreenReader,
} from "../keyboard-nav.js";

// Application state
let tasks = [];
let currentFilter = "all";

let searchState = {
  status: "idle",
  results: [],
  error: null,
  query: "",
};

/**
 * Convert older saved tasks into the new Day 7 task shape.
 * Old tasks used "title"; new tasks use "text".
 */
function normalizeTasks(savedTasks) {
  if (!Array.isArray(savedTasks)) {
    return [];
  }

  return savedTasks.map((task) => ({
    id: String(task.id),
    text: task.text ?? task.title ?? "Untitled task",
    completed: Boolean(task.completed),
    priority: task.priority ?? "medium",
    createdAt: task.createdAt ?? new Date().toISOString(),
  }));
}

/**
 * Return a debounced version of a function.
 */
function debounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Save the current task array.
 */
function saveCurrentTasks() {
  storage.set(tasks);
}

/**
 * Update the task statistics shown on the page.
 */
function updateStats() {
  const statsElement = document.getElementById("stats");

  if (!statsElement) {
    return;
  }

  const { total, active, completed } = getStats(tasks);

  statsElement.textContent =
    `${total} task${total !== 1 ? "s" : ""} · ` +
    `${active} active · ${completed} done`;
}

/**
 * Show which filter button is currently selected.
 */
function updateFilterButtons() {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

/**
 * Render all tasks for the selected filter.
 */
function renderTasks() {
  const listElement = document.getElementById("task-list");
  const emptyElement = document.getElementById("empty-state");

  if (!listElement || !emptyElement) {
    return;
  }

  const visibleTasks = filterTasks(tasks, currentFilter);

  if (visibleTasks.length === 0) {
    listElement.innerHTML = "";
    emptyElement.hidden = false;
  } else {
    emptyElement.hidden = true;
    listElement.innerHTML = visibleTasks.map(renderTaskItem).join("");
  }

  updateStats();
  updateFilterButtons();
}

/**
 * Update and render the book-search state.
 */
function updateSearchState(partialState) {
  const resultsContainer = document.querySelector(
    '[data-testid="search-results"]',
  );

  if (!resultsContainer) {
    return;
  }

  searchState = {
    ...searchState,
    ...partialState,
  };

  resultsContainer.innerHTML = renderSearchResults(searchState);
}

/**
 * Search Open Library.
 */
async function handleBookSearch(query) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    updateSearchState({
      status: "idle",
      query: trimmedQuery,
      results: [],
      error: null,
    });

    return;
  }

  updateSearchState({
    status: "loading",
    query: trimmedQuery,
    error: null,
  });

  try {
    const results = await searchBooks(trimmedQuery, 10);

    updateSearchState({
      status: "success",
      results,
      error: null,
    });
  } catch (error) {
    console.error("[main] Book search failed:", error);

    updateSearchState({
      status: "error",
      error,
      results: [],
    });
  }
}

/**
 * Add a searched book as a task.
 */
function handleBookImport(title) {
  try {
    const newTask = createTask(`Read: ${title}`, "medium");

    tasks = [...tasks, newTask];

    saveCurrentTasks();
    renderTasks();

    announceToScreenReader(`${title} added as a task`);
  } catch (error) {
    console.error("[main] Could not import book:", error);
    announceToScreenReader("Could not add book as a task", "assertive");
  }
}

/**
 * Handle adding a new task.
 */
function handleSubmit(event) {
  event.preventDefault();

  const taskInput = document.getElementById("task-input");
  const errorElement = document.getElementById("form-error");

  if (!taskInput || !errorElement) {
    return;
  }

  errorElement.textContent = "";

  try {
    const newTask = createTask(taskInput.value);

    tasks = [...tasks, newTask];

    saveCurrentTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();

    announceToScreenReader("Task added");
  } catch (error) {
    errorElement.textContent = error.message;
    taskInput.focus();

    announceToScreenReader(error.message, "assertive");
  }
}

/**
 * Handle checkbox and delete-button clicks.
 */
function handleTaskListClick(event) {
  const taskItem = event.target.closest("[data-id]");

  if (!taskItem) {
    return;
  }

  const id = String(taskItem.dataset.id);

  if (event.target.matches(".task-item__checkbox")) {
    const task = tasks.find((item) => item.id === id);

    if (!task) {
      return;
    }

    tasks = updateTask(tasks, id, {
      completed: !task.completed,
    });

    saveCurrentTasks();
    renderTasks();

    announceToScreenReader("Task updated");
  }

  if (event.target.matches(".task-item__delete")) {
    tasks = deleteTask(tasks, id);

    saveCurrentTasks();
    renderTasks();
    moveFocusAfterDelete(id);

    announceToScreenReader("Task deleted");
  }
}

/**
 * Handle filter-button clicks.
 */
function handleFilterClick(event, keyboardNavigation) {
  const filterButton = event.target.closest(".filter-btn");

  if (!filterButton) {
    return;
  }

  currentFilter = filterButton.dataset.filter || "all";

  updateFilterButtons();
  keyboardNavigation.resetTabindex();
  renderTasks();

  announceToScreenReader(`Showing ${currentFilter} tasks`);
}

/**
 * Remove all completed tasks.
 */
function handleClearCompleted() {
  tasks = tasks.filter((task) => !task.completed);

  saveCurrentTasks();
  renderTasks();

  announceToScreenReader("Completed tasks cleared");
}

/**
 * Parse and display the AI Study Coach JSON.
 */
function handleParseStudyPlan() {
  const studyInput = document.getElementById("study-input");
  const output = document.getElementById("study-output");
  const errorElement = document.getElementById("study-error");

  if (!studyInput || !output || !errorElement) {
    return;
  }

  errorElement.textContent = "";
  output.innerHTML = "";

  try {
    const plan = JSON.parse(studyInput.value);

    if (!Array.isArray(plan.days)) {
      throw new Error("The JSON must contain a days array.");
    }

    output.innerHTML = plan.days
      .map((day) => {
        const exercises = Array.isArray(day.exercises) ? day.exercises : [];

        return `
          <section class="study-day">
            <h3>
              Day ${escapeHtml(day.day)}:
              ${escapeHtml(day.topic)}
            </h3>

            <ul>
              ${exercises
                .map((exercise) => `<li>${escapeHtml(exercise)}</li>`)
                .join("")}
            </ul>
          </section>
        `;
      })
      .join("");

    announceToScreenReader("Study plan parsed");
  } catch (error) {
    errorElement.textContent = "Invalid JSON!";
    announceToScreenReader("Invalid JSON", "assertive");
  }
}

/**
 * Start the application after the HTML is loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  tasks = normalizeTasks(storage.get());

  saveCurrentTasks();
  renderTasks();

  const keyboardNavigation = initFilterKeyboardNav() || {
    resetTabindex() {},
  };

  const form = document.getElementById("add-task-form");
  const taskList = document.getElementById("task-list");
  const filters = document.querySelector(".filters");
  const clearCompletedButton = document.getElementById("clear-completed");
  const parseButton = document.getElementById("parse-btn");

  const searchInput = document.querySelector('[data-testid="search-input"]');

  const resultsContainer = document.querySelector(
    '[data-testid="search-results"]',
  );

  form?.addEventListener("submit", handleSubmit);

  taskList?.addEventListener("click", handleTaskListClick);

  filters?.addEventListener("click", (event) => {
    handleFilterClick(event, keyboardNavigation);
  });

  clearCompletedButton?.addEventListener("click", handleClearCompleted);

  parseButton?.addEventListener("click", handleParseStudyPlan);

  if (searchInput && resultsContainer) {
    const debouncedSearch = debounce((event) => {
      handleBookSearch(event.target.value);
    }, 400);

    searchInput.addEventListener("input", debouncedSearch);

    resultsContainer.addEventListener("click", (event) => {
      const retryButton = event.target.closest(
        '[data-testid="search-retry-btn"]',
      );

      if (retryButton) {
        handleBookSearch(searchState.query);
        return;
      }

      const importButton = event.target.closest(
        '[data-testid^="book-import-"]',
      );

      if (!importButton) {
        return;
      }

      const title = importButton.getAttribute("data-book-title");

      if (title) {
        handleBookImport(title);
      }
    });

    updateSearchState({
      status: "idle",
      results: [],
      error: null,
      query: "",
    });
  } else {
    console.warn(
      "[main] Search elements not found in DOM — skipping search setup",
    );
  }

  // Update the page if another browser tab changes tasks.
  window.addEventListener("storage", (event) => {
    if (event.key === "tasks") {
      tasks = normalizeTasks(storage.get());
      renderTasks();
    }
  });
});
