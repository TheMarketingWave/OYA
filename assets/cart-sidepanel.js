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
      // Get current quantity
      const currentItem = this.sidepanel.querySelector(
        `[data-cart-item="${key}"]`
      );
      const currentQuantityEl = currentItem.querySelector(
        ".cart-item__quantity span"
      );
      const currentQuantity = parseInt(currentQuantityEl.textContent);
      const newQuantity = Math.max(0, currentQuantity + change);

      // Show loading state
      const quantityButtons = currentItem.querySelectorAll(
        ".cart-item__quantity button"
      );
      quantityButtons.forEach((btn) => (btn.disabled = true));

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
      // Re-enable buttons on error
      const currentItem = this.sidepanel.querySelector(
        `[data-cart-item="${key}"]`
      );
      const quantityButtons = currentItem.querySelectorAll(
        ".cart-item__quantity button"
      );
      quantityButtons.forEach((btn) => (btn.disabled = false));
    }
  }

  async removeItem(key) {
    try {
      // Show loading state
      const currentItem = this.sidepanel.querySelector(
        `[data-cart-item="${key}"]`
      );
      currentItem.style.opacity = "0.5";

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
        currentItem.style.opacity = "1";
      }
    }
  }

  async refreshCart() {
    try {
      // Fetch the updated cart data
      const response = await fetch("/cart.js");

      if (!response.ok) {
        throw new Error("Failed to fetch cart data");
      }

      const cart = await response.json();

      // Update the sidepanel content with new cart data
      this.updateSidepanelContent(cart);
    } catch (error) {
      console.error("Error refreshing cart:", error);
      // Don't reload the page, just log the error
      // The cart will be updated on next page load
    }
  }

  updateSidepanelContent(cart) {
    if (!this.sidepanel) return;

    const itemsContainer = this.sidepanel.querySelector(
      ".cart-sidepanel__items"
    );
    const cartHeader = this.sidepanel.querySelector(
      ".cart-sidepanel__header h2"
    );

    if (!itemsContainer) return;

    // Update header count
    if (cartHeader) {
      cartHeader.textContent = `Your Cart (${cart.item_count})`;
    }

    // Clear current items
    itemsContainer.innerHTML = "";

    if (cart.item_count > 0) {
      // Add cart items
      cart.items.forEach((item) => {
        const itemElement = this.createCartItemElement(item);
        itemsContainer.appendChild(itemElement);
      });

      // Add footer with total and buttons
      const footerElement = this.createCartFooterElement(cart);
      itemsContainer.appendChild(footerElement);
    } else {
      // Show empty cart message
      itemsContainer.innerHTML = "<p>Your cart is empty</p>";
    }
  }

  createCartItemElement(item) {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.setAttribute("data-cart-item", item.key);

    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.title}" width="80" height="80">
      <div class="cart-item__details">
        <h3>${item.product_title}</h3>
        <p>${item.variant_title || ""}</p>
        <div class="cart-item__quantity">
          <button data-cart-quantity-minus="${item.key}">-</button>
          <span>${item.quantity}</span>
          <button data-cart-quantity-plus="${item.key}">+</button>
        </div>
      </div>
      <div class="cart-item__price">${this.formatMoney(
        item.final_line_price
      )}</div>
      <button data-cart-remove="${item.key}">Remove</button>
    `;

    return itemDiv;
  }

  createCartFooterElement(cart) {
    const footerDiv = document.createElement("div");
    footerDiv.className = "cart-sidepanel__footer";

    footerDiv.innerHTML = `
      <div class="cart-total">Total: ${this.formatMoney(cart.total_price)}</div>
      <a href="/cart" class="btn btn--secondary">View Cart</a>
      <button class="btn btn--primary" data-cart-checkout>Checkout</button>
    `;

    return footerDiv;
  }

  formatMoney(cents) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  }

  open() {
    if (!this.sidepanel) return;

    this.isOpen = true;
    this.sidepanel.classList.add("is-open");
    document.body.classList.add("cart-sidepanel-open");

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
