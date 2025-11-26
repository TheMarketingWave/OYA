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
        const allContents = accordion.querySelectorAll(
          "[data-accordion-content]"
        );

        allItems.forEach((item) => item.classList.remove("active"));
        allToggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
        allIcons.forEach((i) => (i.textContent = "+"));

        // Reset max-height for smooth closing animation
        allContents.forEach((c) => {
          const currentHeight = c.scrollHeight;
          c.style.maxHeight = currentHeight + "px";
          c.style.paddingBottom = "50px"; // Ensure padding is set

          requestAnimationFrame(() => {
            c.style.maxHeight = "0px";
            c.style.paddingBottom = "0px";
          });
        });
      }

      // Toggle current item if it wasn't active
      if (!isActive) {
        // Set initial state for smooth opening animation
        content.style.maxHeight = "0px";
        content.style.paddingBottom = "0px";

        accordionItem.classList.add("active");
        toggle.setAttribute("aria-expanded", "true");
        if (icon) icon.textContent = "×";

        // Animate to full height with padding
        requestAnimationFrame(() => {
          const targetHeight = content.scrollHeight;
          content.style.maxHeight = targetHeight + 50 + "px"; // Add 50px for padding
          content.style.paddingBottom = "50px";

          // After animation completes, remove inline styles so CSS can take over
          setTimeout(() => {
            content.style.maxHeight = "";
            content.style.paddingBottom = "20px";
          }, 400); // Match the CSS transition duration
        });

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

const setLanguageSwitcher = () => {
  const languageSwitcher = document.getElementById("language-switcher");
  const currentLang = document.getElementById("current-language");
  const otherLang = document.getElementById("other-language");

  if (languageSwitcher && currentLang && otherLang) {
    // Function to get current locale
    const getCurrentLocale = () => {
      const htmlLang = document.documentElement.lang || "ro";
      const pathMatch = window.location.pathname.match(/^\/(en|ro)/);
      return pathMatch ? pathMatch[1] : htmlLang;
    };

    // Function to update button display
    const updateDisplay = () => {
      const locale = getCurrentLocale();
      if (locale === "ro") {
        currentLang.textContent = "RO";
        otherLang.textContent = "EN";
        currentLang.className = "current";
        otherLang.className = "other";
      } else {
        currentLang.textContent = "EN";
        otherLang.textContent = "RO";
        currentLang.className = "current";
        otherLang.className = "other";
      }
    };

    // Set initial state
    updateDisplay();

    languageSwitcher.addEventListener("click", () => {
      const currentLocale = getCurrentLocale();
      const targetLocale = currentLocale === "ro" ? "en" : "ro";

      // Build the URL with the new locale
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;

      // Remove existing locale from path if present
      let newPath = currentPath.replace(/^\/(en|ro)/, "");

      // Add new locale prefix only if not Romanian (default)
      if (targetLocale !== "ro") {
        newPath = `/${targetLocale}${newPath}`;
      }

      // Ensure path starts with /
      if (!newPath.startsWith("/")) {
        newPath = `/${newPath}`;
      }

      // Redirect to new locale
      window.location.href = newPath + currentSearch;
    });
  }
};

const onLoad = () => {
  setToggleMenu();
  setSubmenuToggle();
  setAccordionToggle();
  setLanguageSwitcher();
};

if (document.readyState !== "loading") {
  onLoad();
} else {
  document.addEventListener("DOMContentLoaded", onLoad);
}
