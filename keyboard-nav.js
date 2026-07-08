// keyboard-nav.js

export function initFilterKeyboardNav() {
  const filterGroup = document.querySelector(".filters");
  if (!filterGroup) return;

  function getButtons() {
    return Array.from(filterGroup.querySelectorAll(".filter-btn"));
  }

  function setRovingFocus(targetBtn) {
    getButtons().forEach((btn) => {
      btn.setAttribute("tabindex", btn === targetBtn ? "0" : "-1");
    });

    targetBtn.focus();
  }

  function resetTabindex() {
    const buttons = getButtons();
    const active =
      filterGroup.querySelector(".filter-btn.active") || buttons[0];

    buttons.forEach((btn) => {
      btn.setAttribute("tabindex", btn === active ? "0" : "-1");
    });
  }

  resetTabindex();

  filterGroup.addEventListener("keydown", (e) => {
    const buttons = getButtons();
    const currentIndex = buttons.indexOf(document.activeElement);

    if (currentIndex === -1) return;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setRovingFocus(buttons[(currentIndex + 1) % buttons.length]);
    }

    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setRovingFocus(
        buttons[(currentIndex - 1 + buttons.length) % buttons.length],
      );
    }

    if (e.key === "Home") {
      e.preventDefault();
      setRovingFocus(buttons[0]);
    }

    if (e.key === "End") {
      e.preventDefault();
      setRovingFocus(buttons[buttons.length - 1]);
    }
  });

  filterGroup.addEventListener("click", () => {
    resetTabindex();
  });

  return { resetTabindex };
}

export function moveFocusAfterDelete() {
  const items = document.querySelectorAll("#task-list [data-id]");

  if (items.length === 0) {
    document.getElementById("task-input")?.focus();
    return;
  }

  items[0].querySelector('[data-action="delete"]')?.focus();
}

export function announceToScreenReader(message) {
  let announcer = document.getElementById("sr-announcer");

  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = "sr-announcer";
    announcer.className = "sr-only";
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");

    document.body.appendChild(announcer);
  }

  announcer.textContent = "";

  requestAnimationFrame(() => {
    announcer.textContent = message;
  });
}
