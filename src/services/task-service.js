// services/task-service.js
// Pure business logic — no DOM, no localStorage, no side effects.
// Every function is a transformation: input data → output data.

/**
 * Create a new task object.
 * @param {string} text - Task description
 * @param {'low'|'medium'|'high'} priority - Task priority level
 * @returns {Object} New task object
 */
export function createTask(text, priority = "medium") {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Task text must be a non-empty string");
  }
  return {
    id: Date.now().toString(),
    text: text.trim(),
    completed: false,
    priority,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Return a new tasks array with one task updated.
 * @param {Object[]} tasks - Current task array
 * @param {string} id - ID of task to update
 * @param {Object} changes - Partial task fields to merge
 * @returns {Object[]} New array with task updated
 */
export function updateTask(tasks, id, changes) {
  return tasks.map((task) => (task.id === id ? { ...task, ...changes } : task));
}

/**
 * Return a new tasks array with one task removed.
 * @param {Object[]} tasks - Current task array
 * @param {string} id - ID of task to remove
 * @returns {Object[]} New array without the specified task
 */
export function deleteTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

/**
 * Filter tasks by completion status.
 * @param {Object[]} tasks - Current task array
 * @param {'all'|'active'|'completed'} filter - Filter to apply
 * @returns {Object[]} Filtered task array
 */
export function filterTasks(tasks, filter) {
  switch (filter) {
    case "active":
      return tasks.filter((task) => !task.completed);
    case "completed":
      return tasks.filter((task) => task.completed);
    case "all":
    default:
      return tasks;
  }
}

/**
 * Compute summary statistics for a task list.
 * @param {Object[]} tasks - Current task array
 * @returns {{ total: number, completed: number, active: number, byPriority: Object }}
 */
export function getStats(tasks) {
  const completed = tasks.filter((t) => t.completed).length;
  const byPriority = tasks.reduce(
    (acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0 },
  );
  return {
    total: tasks.length,
    completed,
    active: tasks.length - completed,
    byPriority,
  };
}
