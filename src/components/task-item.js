// components/task-item.js
// Renders a single task as an HTML string.
// Imports escapeHtml to prevent XSS on user-supplied task text.
import { escapeHtml } from "../utils/dom.js";

const PRIORITY_CLASSES = {
  low: "badge-low",
  medium: "badge-medium",
  high: "badge-high",
};

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

/**
 * Render a task card as an HTML string.
 * @param {Object} task - Task object from task-service
 * @param {string} task.id
 * @param {string} task.text
 * @param {boolean} task.completed
 * @param {'low'|'medium'|'high'} task.priority
 * @param {string} task.createdAt - ISO date string
 * @returns {string} HTML markup for one task card
 */
export function renderTaskItem(task) {
  const checkedAttr = task.completed ? "checked" : "";
  const completedClass = task.completed ? "task-item--completed" : "";
  const priorityClass =
    PRIORITY_CLASSES[task.priority] || PRIORITY_CLASSES.medium;
  const priorityLabel = PRIORITY_LABELS[task.priority] || "Medium";
  const safeText = escapeHtml(task.text);
  const formattedDate = new Date(task.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `
    <li class="task-item ${completedClass}" data-testid="task-item-${task.id}" data-id="${task.id}">
      <label class="task-item__checkbox-label">
        <input
          type="checkbox"
          class="task-item__checkbox"
          ${checkedAttr}
          aria-label="Mark '${safeText}' as ${task.completed ? "incomplete" : "complete"}"
          data-testid="task-checkbox-${task.id}"
        />
        <span class="task-item__text">${safeText}</span>
      </label>
      <span class="task-item__badge ${priorityClass}" aria-label="Priority: ${priorityLabel}">
        ${priorityLabel}
      </span>
      <time class="task-item__date" datetime="${task.createdAt}">${formattedDate}</time>
      <button
        class="task-item__delete"
        aria-label="Delete task: ${safeText}"
        data-testid="task-delete-${task.id}"
      >
        &times;
      </button>
    </li>
  `.trim();
}
