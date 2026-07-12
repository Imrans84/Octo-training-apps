// utils/dom.js
// Reusable DOM utilities. Zero dependencies on other project files.

/**
 * Escape a string for safe insertion into HTML.
 * Prevents XSS when rendering user-provided text.
 * @param {string} str - Raw user input
 * @returns {string} HTML-safe string
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Create a DOM element with attributes and optional children.
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Key/value attribute map
 * @param {(string|Node)[]} children - Child strings or nodes to append
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "className") {
      el.className = value;
    } else if (key.startsWith("data-")) {
      el.setAttribute(key, value);
    } else {
      el[key] = value;
    }
  });
  children.forEach((child) => {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  return el;
}

/**
 * Show a previously hidden element by removing the 'hidden' class.
 * @param {HTMLElement} el
 */
export function showElement(el) {
  el.classList.remove("hidden");
  el.removeAttribute("aria-hidden");
}

/**
 * Hide an element by adding the 'hidden' class.
 * @param {HTMLElement} el
 */
export function hideElement(el) {
  el.classList.add("hidden");
  el.setAttribute("aria-hidden", "true");
}

/**
 * Toggle a loading state on a button or container.
 * @param {HTMLElement} el - Element to mark as loading
 * @param {boolean} isLoading - Whether loading is active
 */
export function setLoading(el, isLoading) {
  if (isLoading) {
    el.setAttribute("aria-busy", "true");
    el.setAttribute("data-loading", "true");
    if (el.tagName === "BUTTON") {
      el.disabled = true;
    }
  } else {
    el.removeAttribute("aria-busy");
    el.removeAttribute("data-loading");
    if (el.tagName === "BUTTON") {
      el.disabled = false;
    }
  }
}
