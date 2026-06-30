if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "login.html";
}

// app.js — DOM wiring only; all data logic lives in tasks.js
import {
  addTask,
  toggleTask,
  deleteTask,
  setFilter,
  getFilter,
  getFilteredTasks,
  getStats,
  clearCompleted,
} from "./tasks.js";

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderTasks() {
  const listEl = document.getElementById("task-list");
  const emptyEl = document.getElementById("empty-state");
  const tasks = getFilteredTasks();

  if (tasks.length === 0) {
    listEl.innerHTML = "";
    emptyEl.hidden = false;
  } else {
    emptyEl.hidden = true;
    listEl.innerHTML = tasks
      .map(
        (task) => `
        <li class="task-item ${task.completed ? "completed" : ""}" data-id="${task.id}">
          <input
            type="checkbox"
            ${task.completed ? "checked" : ""}
            aria-label="Mark ${escapeHtml(task.title)} complete"
            data-action="toggle"
            data-testid="task-item-toggle"
          />
          <span class="task-title">${escapeHtml(task.title)}</span>
          <button
            class="task-delete"
            aria-label="Delete ${escapeHtml(task.title)}"
            data-action="delete"
            data-testid="task-item-delete"
          >✕</button>
        </li>
      `,
      )
      .join("");
  }

  updateStats();
}

function updateStats() {
  const { total, active, completed } = getStats();
  const statsEl = document.getElementById("stats");

  statsEl.textContent = `${total} task${total !== 1 ? "s" : ""} · ${active} active · ${completed} done`;
}

function updateFilterButtons() {
  const filter = getFilter();

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
  updateFilterButtons();

  // Add task
  const form = document.getElementById("add-task-form");
  const taskInput = document.getElementById("task-input");
  const errorEl = document.getElementById("form-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    try {
      addTask(taskInput.value);
      taskInput.value = "";
      renderTasks();
    } catch (err) {
      errorEl.textContent = err.message;
      taskInput.focus();
    }
  });

  // Toggle and delete task
  const listEl = document.getElementById("task-list");

  listEl.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    const taskItem = e.target.closest("[data-id]");

    if (!taskItem) return;

    const id = Number(taskItem.dataset.id);

    if (action === "toggle") {
      toggleTask(id);
      renderTasks();
    }

    if (action === "delete") {
      deleteTask(id);
      renderTasks();
    }
  });

  // Filter buttons
  document.querySelector(".filters").addEventListener("click", (e) => {
    if (!e.target.matches(".filter-btn")) return;

    setFilter(e.target.dataset.filter);
    updateFilterButtons();
    renderTasks();
  });

  // Clear completed
  document.getElementById("clear-completed").addEventListener("click", () => {
    clearCompleted();
    renderTasks();
  });

  // AI Study Coach
  const parseBtn = document.getElementById("parse-btn");
  const studyInput = document.getElementById("study-input");
  const output = document.getElementById("study-output");
  const studyError = document.getElementById("study-error");

  parseBtn.addEventListener("click", () => {
    studyError.textContent = "";
    output.innerHTML = "";

    try {
      const plan = JSON.parse(studyInput.value);

      let html = "";

      plan.days.forEach((day) => {
        html += `
          <h3>Day ${day.day}: ${day.topic}</h3>
          <ul>
            ${day.exercises.map((ex) => `<li>${escapeHtml(ex)}</li>`).join("")}
          </ul>
        `;
      });

      output.innerHTML = html;
    } catch (err) {
      studyError.textContent = "Invalid JSON!";
    }
  });

  // Cross-tab sync
  window.addEventListener("storage", (e) => {
    if (e.key === "task-manager-v1") {
      renderTasks();
    }
  });
});
