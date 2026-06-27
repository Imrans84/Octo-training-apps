let count = 0;

function increment() {
  count++;
  document.getElementById("count").textContent = count;
}

function reset() {
  count = 0;
  document.getElementById("count").textContent = count;
}
