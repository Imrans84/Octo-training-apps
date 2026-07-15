// services/book-search-service.js
// Thin integration layer for the Open Library Search API.
// Translates external API shape into our internal Book model.
import { apiFetch } from "./api-service.js";

const BASE_URL = "https://openlibrary.org/search.json";

/**
 * @typedef {Object} Book
 * @property {string} id - Open Library work key (e.g. "/works/OL123W")
 * @property {string} title - Book title
 * @property {string} author - Primary author name or 'Unknown'
 * @property {number|null} year - First publish year, or null
 * @property {string[]} subjects - Up to 3 subject tags
 */

/**
 * Search Open Library for books matching a query string.
 * @param {string} query - Search terms (title, author, subject)
 * @param {number} limit - Max results to return (default 10)
 * @returns {Promise<Book[]>} Array of matched books in our internal shape
 */
export async function searchBooks(query, limit = 10) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const encodedQuery = encodeURIComponent(query.trim());
  const url = `${BASE_URL}?q=${encodedQuery}&limit=${limit}`;

  const data = await apiFetch(url);

  const docs = Array.isArray(data.docs) ? data.docs : [];

  return docs.map((doc) => ({
    id: doc.key,
    title: doc.title || "Untitled",
    author: doc.author_name?.[0] ?? "Unknown",
    year: doc.first_publish_year ?? null,
    subjects: doc.subject?.slice(0, 3) ?? [],
  }));
}
