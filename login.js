const loginBtn = document.getElementById("login-btn");

loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const error = document.getElementById("login-error");

  if (username === "sumaira" && password === "student123") {
    localStorage.setItem("loggedIn", "true");

    // save display name
    localStorage.setItem("username", "Sumaira");

    // save role
    localStorage.setItem("role", "student");

    window.location.href = "welcome.html";
  } else {
    error.textContent = "Wrong username or password";
  }
});
