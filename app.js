// Day 2: replaced all onclick attributes with addEventListener
// Compared to Day 1: no global functions called from HTML, DOMContentLoaded wrapper,
// input validation with error messages, safe rendering via escapeHtml()

const ideas = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-btn").addEventListener("click", addIdea);
  document.getElementById("clear-btn").addEventListener("click", clearIdeas);

  // Enter key shortcut — users expect this on text inputs
  document.getElementById("idea-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addIdea();
  });

  renderIdeas(); // render empty state on load
});

function addIdea() {
  const input = document.getElementById("idea-input");
  const errorMsg = document.getElementById("error-msg");
  const text = input.value.trim(); // always trim first

  // Validate — show a specific message, don't silently ignore
  if (!text) {
    errorMsg.textContent = "Please enter an idea before adding.";
    input.focus();
    return;
  }

  errorMsg.textContent = ""; // clear any previous error
  ideas.push({ id: Date.now(), text });
  input.value = "";
  input.focus(); // re-focus so user can type the next idea immediately
  renderIdeas();
}

function clearIdeas() {
  ideas.length = 0; // mutate in place — same array reference
  renderIdeas();
}

function renderIdeas() {
  const list = document.getElementById("ideas-list");

  if (ideas.length === 0) {
    list.innerHTML = '<p class="empty">No ideas yet. Add one above!</p>';
    return;
  }

  // Build HTML string — escapeHtml() is REQUIRED before injecting user text
  list.innerHTML = ideas
    .map(
      (idea) => `
      <div class="idea-card">
        <span>${escapeHtml(idea.text)}</span>
        <button onclick="removeIdea(${idea.id})" aria-label="Remove idea">✕</button>
      </div>
    `,
    )
    .join("");
}

function removeIdea(id) {
  // findIndex + splice: O(n) but fine for a small list
  const idx = ideas.findIndex((i) => i.id === id);
  if (idx !== -1) ideas.splice(idx, 1);
  renderIdeas();
}

// Prevents XSS when injecting user text into innerHTML
// Converts <script> to &lt;script&gt; so it renders as text, not code
function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}
