const setToggleMenu = () => {
  const menuContainer = document.getElementById("custom-menu-container");
  const menuButton = document.getElementById("custom-menu-button");
  console.log(menuContainer, menuButton);

  if (menuContainer && menuButton) {
    menuButton.addEventListener("click", () => {
      console.log("in");

      menuContainer.classList.toggle("menu-open");
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

console.log("in");
