// utils/storage.js
// Thin wrapper around localStorage that handles parse errors gracefully.

class StorageService {
  /**
   * @param {string} key - The localStorage key this instance manages
   */
  constructor(key) {
    this.key = key;
  }

  /**
   * Read and parse the stored value.
   * @returns {*} Parsed value, or null if missing or corrupt
   */
  get() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[StorageService] Failed to parse key "${this.key}"`, err);
      return null;
    }
  }

  /**
   * Serialize and store a value.
   * @param {*} value - Any JSON-serializable value
   */
  set(value) {
    try {
      localStorage.setItem(this.key, JSON.stringify(value));
    } catch (err) {
      console.error(`[StorageService] Failed to write key "${this.key}"`, err);
    }
  }

  /**
   * Remove this key from localStorage.
   */
  remove() {
    try {
      localStorage.removeItem(this.key);
    } catch (err) {
      console.error(`[StorageService] Failed to remove key "${this.key}"`, err);
    }
  }

  /**
   * Clear all localStorage (use with caution in shared environments).
   */
  clear() {
    try {
      localStorage.clear();
    } catch (err) {
      console.error("[StorageService] Failed to clear localStorage", err);
    }
  }
}

// Export a pre-configured singleton. Import this directly — don't instantiate again.
export default new StorageService("tasks");
