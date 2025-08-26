const scrollDown = () => {
  window.scrollBy({
    top: window.innerHeight,
    behavior: "smooth",
  });
};

const setToggleMenu = () => {
  const menuContainer = document.getElementById("custom-menu-container");
  const menuButton = document.getElementById("custom-menu-button");

  if (menuContainer && menuButton) {
    menuButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (menuContainer.classList.contains("menu-open")) {
        // Closing animation - remove both classes at the same time
        console.log("Closing menu");
        menuContainer.classList.remove("menu-open");
        menuButton.classList.remove("menu-open");
        menuButton.setAttribute("aria-label", "Toggle menu");
        setTimeout(() => {
          menuContainer.style.display = "none";
        }, 400); // Match the CSS transition duration
      } else {
        // Opening animation - add both classes at the same time
        console.log("Opening menu");
        menuContainer.style.display = "block";
        // Force reflow to ensure display change is applied
        menuContainer.offsetHeight;
        menuContainer.classList.add("menu-open");
        menuButton.classList.add("menu-open");
        menuButton.setAttribute("aria-label", "Close menu");
      }
    });
  }
};

const setSubmenuToggle = () => {
  const expandButtons = document.querySelectorAll("[data-submenu-toggle]");

  expandButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const submenu = button.closest(".menu-item").querySelector(".submenu");

      if (submenu) {
        submenu.classList.toggle("expanded");
        button.classList.toggle("expanded");

        // Update aria-label for accessibility
        if (submenu.classList.contains("expanded")) {
          button.setAttribute("aria-label", "Collapse submenu");
        } else {
          button.setAttribute("aria-label", "Expand submenu");
        }
      }
    });
  });
};

const onLoad = () => {
  setToggleMenu();
  setSubmenuToggle();
};

if (document.readyState !== "loading") {
  onLoad();
} else {
  document.addEventListener("DOMContentLoaded", onLoad);
}
