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

const setAccordionToggle = () => {
  const accordionToggles = document.querySelectorAll("[data-accordion-toggle]");

  accordionToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();

      const accordionItem = toggle.closest("[data-accordion-item]");
      const accordion = toggle.closest("[data-accordion]");
      const content = accordionItem.querySelector("[data-accordion-content]");
      const icon = toggle.querySelector(".accordion-icon");

      if (!accordionItem || !content) return;

      const isActive = accordionItem.classList.contains("active");

      // Close all accordion items in the same accordion
      if (accordion) {
        const allItems = accordion.querySelectorAll("[data-accordion-item]");
        const allToggles = accordion.querySelectorAll(
          "[data-accordion-toggle]"
        );
        const allIcons = accordion.querySelectorAll(".accordion-icon");

        allItems.forEach((item) => item.classList.remove("active"));
        allToggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
        allIcons.forEach((i) => (i.textContent = "+"));
      }

      // Toggle current item if it wasn't active
      if (!isActive) {
        accordionItem.classList.add("active");
        toggle.setAttribute("aria-expanded", "true");
        if (icon) icon.textContent = "×";

        // Trigger custom event for onExpand callback
        const expandEvent = new CustomEvent("accordionExpand", {
          detail: {
            item: accordionItem,
            content: content,
            title: toggle.querySelector("span")?.textContent || "",
          },
        });
        accordionItem.dispatchEvent(expandEvent);
      }
    });
  });
};

const onLoad = () => {
  setToggleMenu();
  setSubmenuToggle();
  setAccordionToggle();
};

if (document.readyState !== "loading") {
  onLoad();
} else {
  document.addEventListener("DOMContentLoaded", onLoad);
}
