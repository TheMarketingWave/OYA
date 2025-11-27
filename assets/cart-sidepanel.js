class CartSidepanel {
  constructor() {
    this.sidepanel = document.getElementById("cart-sidepanel");
    this.isOpen = false;
    this.bindEvents();
  }

  bindEvents() {
    // Open cart sidepanel - look for cart buttons in header
    document.addEventListener("click", (e) => {
      if (
        e.target.matches("[data-cart-open]") ||
        e.target.closest("[data-cart-open]") ||
        e.target.matches(".cart-icon") ||
        e.target.closest(".cart-icon")
      ) {
        e.preventDefault();
        this.open();
      }
    });

    // Close cart sidepanel
    document.addEventListener("click", (e) => {
      if (
        e.target.matches("[data-cart-close]") ||
        e.target.closest("[data-cart-close]")
      ) {
        this.close();
      }
    });

    // Close on overlay click
    if (this.sidepanel) {
      this.sidepanel.addEventListener("click", (e) => {
        if (e.target.classList.contains("cart-sidepanel__overlay")) {
          this.close();
        }
      });
    }

    // Update quantities
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-cart-quantity-plus]")) {
        const key = e.target.dataset.cartQuantityPlus;
        this.updateQuantity(key, 1);
      }
      if (e.target.matches("[data-cart-quantity-minus]")) {
        const key = e.target.dataset.cartQuantityMinus;
        this.updateQuantity(key, -1);
      }
    });

    // Remove items
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-cart-remove]")) {
        const key = e.target.dataset.cartRemove;
        this.removeItem(key);
      }
    });

    // Checkout button
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-cart-checkout]")) {
        window.location.href = "/checkout";
      }
    });

    // Close on ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });

    // Listen for cart updates from other parts of the site
    document.addEventListener("cart:updated", (e) => {
      // Always refresh cart data when updated
      this.refreshCart();

      // Update cart badge in header
      this.updateCartBadge();
    });
  }

  async updateQuantity(key, change) {
    try {
      // Get current item and show loading state
      const currentItem = this.sidepanel.querySelector(
        `[data-cart-item="${key}"]`
      );
      if (!currentItem) return;

      // Add loading class to the item
      currentItem.classList.add("loading");

      // Disable quantity buttons (but no loading class on buttons)
      const quantityButtons = currentItem.querySelectorAll(
        ".cart-item__quantity button, [data-cart-quantity-plus], [data-cart-quantity-minus]"
      );
      quantityButtons.forEach((btn) => {
        btn.disabled = true;
      });

      // Get current quantity
      const currentQuantityEl = currentItem.querySelector(
        ".cart-item__quantity span, .quantity-display"
      );
      const currentQuantity = parseInt(currentQuantityEl.textContent);
      const newQuantity = Math.max(0, currentQuantity + change);

      const response = await fetch("/cart/change.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: key,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        await this.refreshCart();

        // Trigger global cart update event
        document.dispatchEvent(
          new CustomEvent("cart:updated", {
            detail: {
              action: "quantity_updated",
              key: key,
              quantity: newQuantity,
            },
          })
        );
      } else {
        throw new Error("Failed to update cart");
      }
    } catch (error) {
      console.error("Error updating cart:", error);

      // Remove loading states on error
      const currentItem = this.sidepanel.querySelector(
        `[data-cart-item="${key}"]`
      );
      if (currentItem) {
        currentItem.classList.remove("loading");
        const quantityButtons = currentItem.querySelectorAll(
          ".cart-item__quantity button, [data-cart-quantity-plus], [data-cart-quantity-minus]"
        );
        quantityButtons.forEach((btn) => {
          btn.disabled = false;
        });
      }
    }
  }

  async removeItem(key) {
    try {
      // Get current item and show loading state
      const currentItem = this.sidepanel.querySelector(
        `[data-cart-item="${key}"]`
      );
      if (!currentItem) return;

      // Add loading class and disable all interactions
      currentItem.classList.add("loading");
      const itemButtons = currentItem.querySelectorAll("button");
      itemButtons.forEach((btn) => {
        btn.disabled = true;
      });

      const response = await fetch("/cart/change.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: key,
          quantity: 0,
        }),
      });

      if (response.ok) {
        await this.refreshCart();

        // Trigger global cart update event
        document.dispatchEvent(
          new CustomEvent("cart:updated", {
            detail: { action: "item_removed", key: key },
          })
        );
      } else {
        throw new Error("Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);

      // Restore item on error
      const currentItem = this.sidepanel.querySelector(
        `[data-cart-item="${key}"]`
      );
      if (currentItem) {
        currentItem.classList.remove("loading");
        const itemButtons = currentItem.querySelectorAll("button");
        itemButtons.forEach((btn) => {
          btn.disabled = false;
        });
      }
    }
  }

  async refreshCart() {
    try {
      // Show loading state on cart items container
      const itemsContainer = document.getElementById(
        "cart-sidepanel-items-container"
      );
      if (itemsContainer) {
        itemsContainer.classList.add("refreshing");
      }

      // Fetch the updated cart content from the section
      const response = await fetch("/?sections=cart-sidepanel-content");

      if (!response.ok) {
        throw new Error("Failed to fetch cart section");
      }

      const data = await response.json();

      if (data["cart-sidepanel-content"]) {
        // Update the cart items container with new HTML
        if (itemsContainer) {
          itemsContainer.innerHTML = data["cart-sidepanel-content"];
          itemsContainer.classList.remove("refreshing");
        }

        // Update the cart header count
        this.updateCartHeader();
      }
    } catch (error) {
      console.error("Error refreshing cart:", error);

      // Remove loading state on error
      const itemsContainer = document.getElementById(
        "cart-sidepanel-items-container"
      );
      if (itemsContainer) {
        itemsContainer.classList.remove("refreshing");
      }
    }
  }

  async updateCartHeader() {
    try {
      // Fetch current cart data for header update
      const response = await fetch("/cart.js");
      if (response.ok) {
        const cart = await response.json();
        const cartHeader = document.getElementById("cart-count-header");
        if (cartHeader) {
          const cartTitle = cartHeader.dataset.cartTitle || "Your Cart";
          cartHeader.textContent = `${cartTitle} (${cart.item_count})`;
        }
      }
    } catch (error) {
      console.error("Error updating cart header:", error);
    }
  }

  // Show/hide loading overlay for entire sidepanel
  showLoadingOverlay() {
    let overlay = this.sidepanel.querySelector(".cart-loading-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "cart-loading-overlay";
      overlay.innerHTML = '<div class="cart-loading-spinner"></div>';
      this.sidepanel
        .querySelector(".cart-sidepanel__content")
        .appendChild(overlay);
    }
    overlay.classList.add("visible");
  }

  hideLoadingOverlay() {
    const overlay = this.sidepanel.querySelector(".cart-loading-overlay");
    if (overlay) {
      overlay.classList.remove("visible");
    }
  }

  async open() {
    if (!this.sidepanel) return;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty(
      "--scrollbar-width",
      `${scrollbarWidth}px`
    );

    this.isOpen = true;
    this.sidepanel.classList.add("is-open");
    document.body.classList.add("cart-sidepanel-open");

    // Disable GSAP ScrollSmoother if available
    if (window.ScrollSmoother && window.ScrollSmoother.get()) {
      this.scrollSmoother = window.ScrollSmoother.get();
      this.scrollSmoother.paused(true);
    }

    // Show loading overlay while refreshing cart data
    this.showLoadingOverlay();

    // Refresh cart data when opening
    try {
      await this.refreshCart();
    } finally {
      this.hideLoadingOverlay();
    }

    // Focus management for accessibility
    const closeButton = this.sidepanel.querySelector("[data-cart-close]");
    if (closeButton) {
      setTimeout(() => closeButton.focus(), 100);
    }

    // Trigger open event
    document.dispatchEvent(new CustomEvent("cart:sidepanel:opened"));
  }

  close() {
    if (!this.sidepanel) return;

    this.isOpen = false;
    this.sidepanel.classList.remove("is-open");
    document.body.classList.remove("cart-sidepanel-open");

    // Reset scrollbar width compensation
    document.documentElement.style.setProperty("--scrollbar-width", "0px");

    // Re-enable GSAP ScrollSmoother if it was paused
    if (this.scrollSmoother) {
      this.scrollSmoother.paused(false);
      this.scrollSmoother = null;
    }

    // Trigger close event
    document.dispatchEvent(new CustomEvent("cart:sidepanel:closed"));
  }

  // Public method to check if sidepanel is open
  isCartOpen() {
    return this.isOpen;
  }

  // Update cart badge in header
  async updateCartBadge() {
    try {
      const response = await fetch("/cart.js");
      if (response.ok) {
        const cart = await response.json();
        const badge = document.querySelector(".cart-badge");

        if (badge) {
          badge.textContent = cart.item_count;

          if (cart.item_count > 0) {
            badge.classList.add("visible");
          } else {
            badge.classList.remove("visible");
          }
        }
      }
    } catch (error) {
      console.error("Error updating cart badge:", error);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.cartSidepanel = new CartSidepanel();
});

// Also make it available globally for other scripts
window.CartSidepanel = CartSidepanel;
