// If user is not logged in, go back to login page
if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // Show user information
  document.getElementById("user-name").textContent = "Sumaira";
  document.getElementById("user-role").textContent = "student";

  // Show selected section
  window.showSection = function (sectionId) {
    document.querySelectorAll(".dashboard-box").forEach((box) => {
      box.classList.add("hidden");
    });

    const section = document.getElementById(sectionId);

    if (section) {
      section.classList.remove("hidden");
    }
  };

  // Show Tasks section by default
  showSection("tasks");

  // Logout button
  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.location.href = "login.html";
  });
});
