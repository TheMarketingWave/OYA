const setToggleMenu = () => {
  const menuContainer = document.getElementById("custom-menu-container");
  const menuButton = document.getElementById("custom-menu-button");
  const closeButton = document.getElementById("custom-menu-close");

  if (menuContainer && menuButton) {
    menuButton.addEventListener("click", () => {
      console.log("click");

      menuContainer.classList.toggle("menu-open");
    });
  }

  if (menuContainer && closeButton) {
    closeButton.addEventListener("click", () => {
      menuContainer.classList.remove("menu-open");
    });
  }
};

const onLoad = () => {
  setToggleMenu();
};

if (document.readyState !== "loading") {
  onLoad();
} else {
  document.addEventListener("DOMContentLoaded", onLoad);
}
