// components/search-results.js
// Renders the four states of the book search UI as HTML strings.
import { escapeHtml } from "../utils/dom.js";

/**
 * @typedef {'idle'|'loading'|'error'|'success'} SearchStatus
 * @typedef {{ status: SearchStatus, results: import('../services/book-search-service.js').Book[], error: Error|null, query: string }} SearchState
 */

/**
 * Render the correct UI for the current search state.
 * @param {SearchState} state
 * @returns {string} HTML markup to inject into the results container
 */
export function renderSearchResults(state) {
  switch (state.status) {
    case "idle":
      return `
        <div class="search-results__idle" data-testid="search-idle">
          <p class="search-results__hint">
            Search for a book above to import it as a reading task.
          </p>
        </div>
      `.trim();

    case "loading":
      return `
        <div class="search-results__loading" data-testid="search-loading" aria-live="polite" aria-busy="true">
          <div class="spinner" aria-hidden="true"></div>
          <p>Searching for "${escapeHtml(state.query)}"...</p>
        </div>
      `.trim();

    case "error":
      return `
        <div class="search-results__error" data-testid="search-error" role="alert">
          <p class="search-results__error-message">
            Could not load results: ${escapeHtml(state.error?.message ?? "Unknown error")}
          </p>
          <button
            class="btn btn--secondary"
            data-testid="search-retry-btn"
            type="button"
          >
            Try again
          </button>
        </div>
      `.trim();

    case "success": {
      if (state.results.length === 0) {
        return `
          <div class="search-results__empty" data-testid="search-empty">
            <p>No books found for "${escapeHtml(state.query)}". Try a different search term.</p>
          </div>
        `.trim();
      }

      const bookCards = state.results
        .map(
          (book) => `
        <li class="book-result" data-testid="book-result-${escapeHtml(book.id.replace(/\//g, "-"))}">
          <div class="book-result__info">
            <span class="book-result__title">${escapeHtml(book.title)}</span>
            <span class="book-result__author">by ${escapeHtml(book.author)}</span>
            ${book.year ? `<span class="book-result__year">(${book.year})</span>` : ""}
          </div>
          ${
            book.subjects.length > 0
              ? `<div class="book-result__subjects">${book.subjects.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("")}</div>`
              : ""
          }
          <button
            class="btn btn--primary btn--sm"
            data-testid="book-import-${escapeHtml(book.id.replace(/\//g, "-"))}"
            data-book-id="${escapeHtml(book.id)}"
            data-book-title="${escapeHtml(book.title)}"
            type="button"
          >
            Add as task
          </button>
        </li>
      `,
        )
        .join("");

      return `
        <ul class="book-results-list" data-testid="search-results-list" aria-label="Search results">
          ${bookCards}
        </ul>
      `.trim();
    }

    default:
      return "";
  }
}
