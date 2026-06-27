// tasks.js — pure data logic, no DOM dependencies

export const STORAGE_KEY = "task-manager-v1";

let currentFilter = "all"; // 'all' | 'active' | 'completed'

export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    console.warn("Corrupt task data in localStorage, resetting.");
    return [];
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function addTask(title) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Task title cannot be blank.");
  if (trimmed.length > 200)
    throw new Error("Task title must be 200 characters or fewer.");

  const tasks = loadTasks();
  const newTask = {
    id: Date.now(),
    title: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  const updated = [...tasks, newTask];
  saveTasks(updated);
  return updated;
}

export function toggleTask(id) {
  const tasks = loadTasks();
  const updated = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
  saveTasks(updated);
  return updated;
}

export function deleteTask(id) {
  const tasks = loadTasks();
  const updated = tasks.filter((task) => task.id !== id);
  saveTasks(updated);
  return updated;
}

export function setFilter(filter) {
  if (!["all", "active", "completed"].includes(filter)) {
    throw new Error(`Unknown filter: ${filter}`);
  }
  currentFilter = filter;
}

export function getFilter() {
  return currentFilter;
}

export function getFilteredTasks() {
  const tasks = loadTasks();
  if (currentFilter === "active") return tasks.filter((t) => !t.completed);
  if (currentFilter === "completed") return tasks.filter((t) => t.completed);
  return tasks;
}

export function getStats() {
  const tasks = loadTasks();
  const completed = tasks.filter((t) => t.completed).length;
  return { total: tasks.length, completed, active: tasks.length - completed };
}

export function clearCompleted() {
  const tasks = loadTasks();
  const updated = tasks.filter((t) => !t.completed);
  saveTasks(updated);
  return updated;
}
