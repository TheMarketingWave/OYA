import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js";
import ScrollTrigger from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger.js";

// Initialize when DOM is ready
const initTextScrollAnimation = () => {
  console.log("init");
};

// Export for module usage or initialize immediately
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTextScrollAnimation);
} else {
  initTextScrollAnimation();
}
