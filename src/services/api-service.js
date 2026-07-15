// services/api-service.js
// Generic fetch wrapper with timeout, retry, and structured error handling.

/**
 * Custom error class that carries HTTP status and parsed response body.
 */
export class ApiError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} status - HTTP status code
   * @param {*} data - Parsed response body (if available)
   */
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Fetch a URL with automatic timeout, retry on transient failure,
 * and structured ApiError on non-2xx responses.
 *
 * @param {string} url - Full URL to fetch
 * @param {RequestInit} options - Standard fetch options
 * @param {number} retries - Max retry attempts (default 3)
 * @returns {Promise<any>} Parsed JSON response body
 * @throws {ApiError} On non-ok HTTP response
 * @throws {Error} On network failure after all retries exhausted
 */
export async function apiFetch(url, options = {}, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorData = null;
        try {
          errorData = await res.json();
        } catch {
          // Response body isn't JSON — that's fine
        }
        throw new ApiError(
          `HTTP ${res.status}: ${res.statusText}`,
          res.status,
          errorData,
        );
      }

      return await res.json();
    } catch (err) {
      clearTimeout(timeoutId);

      const isAbort = err.name === "AbortError";
      const isApiError = err instanceof ApiError;
      const isLastAttempt = attempt === retries;

      // Do not retry on ApiError (4xx/5xx) — those are deterministic failures
      // Do not retry on the last attempt
      if (isApiError || isLastAttempt) {
        throw err;
      }

      // Exponential backoff: 1s, 2s, 4s
      const waitMs = Math.pow(2, attempt) * 1000;
      console.warn(
        `[apiFetch] Attempt ${attempt + 1} failed (${isAbort ? "timeout" : err.message}). Retrying in ${waitMs}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}
