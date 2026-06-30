if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "login.html";
}

document.getElementById("user-name").textContent = "Sumaira";
document.getElementById("user-role").textContent = "student";

function showSection(sectionId) {
  document.querySelectorAll(".dashboard-box").forEach((box) => {
    box.classList.add("hidden");
  });

  document.getElementById(sectionId).classList.remove("hidden");
}

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("username");
  localStorage.removeItem("role");

  window.location.href = "login.html";
});
