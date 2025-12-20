/**
 * Product Carousel with GSAP Horizontal Loop
 * Creates a draggable, infinite horizontal carousel for product cards
 */

// ================================
// CONSTANTS
// ================================

const BLUR_STATE = {
  filter: "blur(10px)",
  opacity: 0,
  scale: 0.95,
  duration: 0.4,
  ease: "power3.out",
};

const CLEAR_STATE = {
  filter: "blur(0px)",
  opacity: 1,
  scale: 1,
  duration: 0.4,
  ease: "power3.out",
};

const INTERACTION_BLUR_STATE = {
  // filter: "blur(5px)",
  // opacity: 0.8,
  duration: 0.4,
  ease: "power3.out",
};

// ================================
// MAIN INITIALIZATION
// ================================

const initProductCarousel = () => {
  console.log("Product carousel initialized");

  // Find all carousel containers
  const carouselContainers = document.querySelectorAll(".product-carousel");

  if (!carouselContainers.length) {
    console.warn("No product carousel containers found");
    return;
  }

  // Initialize each carousel separately
  carouselContainers.forEach((container, containerIndex) => {
    const wrapper = container.querySelector(".product-carousel__track");
    const boxes = gsap.utils.toArray(
      container.querySelectorAll(".product-card")
    );

    if (!wrapper || !boxes.length) {
      console.warn(
        `Product carousel elements not found in carousel ${containerIndex}`
      );
      return;
    }

    let activeElement;

    // Initialize the horizontal loop
    const loop = horizontalLoop(boxes, {
      draggable: true,
      center: true,
      onChange: handleActiveElementChange,
    });

    // Set up click handlers for direct navigation
    setupClickNavigation(boxes, loop);

    // Set up navigation button handlers for this specific carousel
    setupNavigationButtons(loop, container);

    // Center the middle element initially
    if (loop && typeof loop.toIndex === "function") {
      const middleIndex = Math.floor(boxes.length / 2);
      loop.toIndex(middleIndex, { duration: 0 });
    }

    // Set up scroll-triggered blur-to-clear animation
    setupScrollAnimation(boxes, container);

    // Handle active element changes
    function handleActiveElementChange(element, index) {
      if (activeElement) {
        activeElement.classList.remove("active");
      }
      element.classList.add("active");
      activeElement = element;
    }
  });
};

// ================================
// EVENT HANDLERS
// ================================

function setupClickNavigation(boxes, loop) {
  boxes.forEach((box, i) => {
    box.addEventListener("click", () => {
      loop.toIndex(i, {
        duration: 0.8,
        ease: "power1.inOut",
      });
    });
  });
}

function setupNavigationButtons(loop, container) {
  const prevBtn = container.querySelector(
    "#carousel-prev-btn, .carousel-prev-btn"
  );
  const nextBtn = container.querySelector(
    "#carousel-next-btn, .carousel-next-btn"
  );

  if (prevBtn && loop && typeof loop.previous === "function") {
    prevBtn.addEventListener("click", () => {
      loop.previous({
        duration: 0.8,
        ease: "power1.inOut",
      });
    });
  }

  if (nextBtn && loop && typeof loop.next === "function") {
    nextBtn.addEventListener("click", () => {
      loop.next({
        duration: 0.8,
        ease: "power1.inOut",
      });
    });
  }
}

// ================================
// SCROLL ANIMATION SETUP
// ================================

function setupScrollAnimation(boxes, container) {
  if (!boxes.length || typeof ScrollTrigger === "undefined") {
    console.warn("ScrollTrigger not available for carousel animation");
    return;
  }

  // Set initial blur state
  gsap.set(boxes, BLUR_STATE);

  // Create timeline with ScrollTrigger (one-time animation)
  const tl = gsap.timeline({
    defaults: { ease: "power2.out", force3D: true },
    scrollTrigger: {
      trigger: container,
      start: "top 50%",
      toggleActions: "play none none none", // Only play once, no reverse
    },
  });

  // Animate all product cards with center-outward stagger
  tl.to(boxes, {
    ...CLEAR_STATE,
    stagger: {
      amount: 0.5,
      from: "center",
    },
  });
}

// ================================
// INITIALIZATION TRIGGER
// ================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProductCarousel);
} else {
  initProductCarousel();
}

// ================================
// HORIZONTAL LOOP UTILITY
// ================================

/**
 * Creates an infinite horizontal loop animation with dragging support
 * @param {Array} items - Array of DOM elements to loop
 * @param {Object} config - Configuration options
 * @returns {GSAPTimeline} The timeline instance with additional methods
 */
function horizontalLoop(items, config) {
  let timeline;
  items = gsap.utils.toArray(items);
  config = config || {};

  gsap.context(() => {
    // ================================
    // VARIABLES & CONFIGURATION
    // ================================

    const onChange = config.onChange;
    const center = config.center;
    const pixelsPerSecond = (config.speed || 1) * 100;
    const snap = gsap.utils.snap(1);

    let lastIndex = 0;
    let curIndex = 0;
    let indexIsDirty = false;
    let timeOffset = 0;
    let totalWidth;
    let timeWrap;

    // Arrays for calculations
    const times = [];
    const widths = [];
    const spaceBefore = [];
    const xPercents = [];

    // Container reference
    const container =
      center === true
        ? items[0].parentNode
        : gsap.utils.toArray(center)[0] || items[0].parentNode;

    const length = items.length;
    const startX = items[0].offsetLeft;

    // ================================
    // TIMELINE SETUP
    // ================================

    const tl = gsap.timeline({
      repeat: 0,
      onUpdate:
        onChange &&
        function () {
          let i = tl.closestIndex();
          if (lastIndex !== i) {
            lastIndex = i;
            onChange(items[i], i);
          }
        },
      paused: true,
      defaults: { ease: "none" },
      onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
    });

    // ================================
    // CALCULATION FUNCTIONS
    // ================================

    const getTotalWidth = () => {
      return (
        items[length - 1].offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        spaceBefore[0] +
        items[length - 1].offsetWidth *
          gsap.getProperty(items[length - 1], "scaleX") +
        (parseFloat(config.paddingRight) || 0)
      );
    };

    const populateWidths = () => {
      let b1 = container.getBoundingClientRect();
      let b2;

      items.forEach((el, i) => {
        widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
        xPercents[i] = snap(
          (parseFloat(gsap.getProperty(el, "x", "px")) / widths[i]) * 100 +
            gsap.getProperty(el, "xPercent")
        );
        b2 = el.getBoundingClientRect();
        spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
        b1 = b2;
      });

      gsap.set(items, {
        xPercent: (i) => xPercents[i],
        force3D: true,
      });

      totalWidth = getTotalWidth();
    };

    const populateOffsets = () => {
      timeOffset = center
        ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth
        : 0;

      if (center) {
        times.forEach((t, i) => {
          times[i] = timeWrap(
            tl.labels["label" + i] +
              (tl.duration() * widths[i]) / 2 / totalWidth -
              timeOffset
          );
        });
      }
    };

    const getClosest = (values, value, wrap) => {
      let i = values.length;
      let closest = 1e10;
      let index = 0;
      let d;

      while (i--) {
        d = Math.abs(values[i] - value);
        if (d > wrap / 2) {
          d = wrap - d;
        }
        if (d < closest) {
          closest = d;
          index = i;
        }
      }
      return index;
    };

    const populateTimeline = () => {
      tl.clear();

      for (let i = 0; i < length; i++) {
        const item = items[i];
        const curX = (xPercents[i] / 100) * widths[i];
        const distanceToStart =
          item.offsetLeft + curX - startX + spaceBefore[0];
        const distanceToLoop =
          distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");

        tl.to(
          item,
          {
            xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
            duration: distanceToLoop / pixelsPerSecond,
          },
          0
        )
          .fromTo(
            item,
            {
              xPercent: snap(
                ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
              ),
            },
            {
              xPercent: xPercents[i],
              duration:
                (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
              immediateRender: false,
            },
            distanceToLoop / pixelsPerSecond
          )
          .add("label" + i, distanceToStart / pixelsPerSecond);

        times[i] = distanceToStart / pixelsPerSecond;
      }

      timeWrap = gsap.utils.wrap(0, tl.duration());
    };

    // ================================
    // REFRESH & RESIZE HANDLING
    // ================================

    const refresh = (deep) => {
      const progress = tl.progress();
      tl.progress(0, true);
      populateWidths();
      if (deep) populateTimeline();
      populateOffsets();
      if (deep && tl.draggable && tl.paused()) {
        tl.time(times[curIndex], true);
      } else {
        tl.progress(progress, true);
      }
    };

    const onResize = () => refresh(true);

    // ================================
    // NAVIGATION METHODS
    // ================================

    function toIndex(index, vars) {
      vars = vars || {};

      // Always go in the shortest direction
      if (Math.abs(index - curIndex) > length / 2) {
        index += index > curIndex ? -length : length;
      }

      let newIndex = gsap.utils.wrap(0, length, index);
      let time = times[newIndex];

      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }

      if (time < 0 || time > tl.duration()) {
        vars.modifiers = { time: timeWrap };
      }

      curIndex = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);

      // Add blur effect during navigation if duration > 0
      if (vars.duration && vars.duration > 0) {
        // Apply blur at start of navigation
        gsap.to(items, INTERACTION_BLUR_STATE);

        // Clear blur when navigation completes
        gsap.delayedCall(vars.duration || 0.8, () => {
          gsap.to(items, CLEAR_STATE);
        });
      }

      return vars.duration === 0
        ? tl.time(timeWrap(time))
        : tl.tweenTo(time, vars);
    }

    // ================================
    // DRAGGABLE SETUP
    // ================================

    let proxy;
    let isDragging = false;

    if (config.draggable && typeof Draggable === "function") {
      proxy = document.createElement("div");

      const wrap = gsap.utils.wrap(0, 1);
      let ratio, startProgress, draggable, lastSnap, initChangeX, wasPlaying;

      const align = () => {
        tl.progress(
          wrap(startProgress + (draggable.startX - draggable.x) * ratio)
        );
      };

      const onDrag = () => {
        align();

        if (!isDragging) {
          // gsap.to(items, {
          //   ...INTERACTION_BLUR_STATE,
          //   ease: "power2.out",
          // });

          isDragging = true;
        }
      };

      const syncIndex = () => tl.closestIndex(true);

      if (typeof InertiaPlugin === "undefined") {
        console.warn(
          "InertiaPlugin required for momentum-based scrolling and snapping."
        );
      }

      draggable = Draggable.create(proxy, {
        trigger: items[0].parentNode,
        type: "x",
        onPressInit() {
          const x = this.x;
          gsap.killTweensOf(tl);
          wasPlaying = !tl.paused();
          tl.pause();
          startProgress = tl.progress();
          refresh();
          ratio = 1 / totalWidth;
          initChangeX = startProgress / -ratio - x;
          gsap.set(proxy, { x: startProgress / -ratio, force3D: true });
        },
        onDrag: onDrag,
        onThrowUpdate: align,
        // INERTIA CONTROLS
        inertia: true,
        overshootTolerance: 0,
        throwResistance: 2500,
        maxDuration: 1.2,
        minDuration: 0.4,
        // INERTIA CONTROLS
        snap(value) {
          if (Math.abs(startProgress / -ratio - this.x) < 10) {
            return lastSnap + initChangeX;
          }

          // Velocity dampening for mobile - limit how far carousel travels on fast swipes
          const velocity = Math.abs(this.getVelocity("x"));
          const velocityThreshold = 2000; // Pixels per second
          let dampening = 1;

          // If velocity is very high, dampen the distance traveled
          if (velocity > velocityThreshold) {
            dampening = Math.max(0.5, 1 - ((velocity - velocityThreshold) / 5000));
          }

          const time = -(value * ratio) * tl.duration();
          const wrappedTime = timeWrap(time);
          const snapTime = times[getClosest(times, wrappedTime, tl.duration())];
          let dif = snapTime - wrappedTime;

          if (Math.abs(dif) > tl.duration() / 2) {
            dif += dif < 0 ? tl.duration() : -tl.duration();
          }

          // Apply dampening to the difference
          dif *= dampening;

          lastSnap = (time + dif) / tl.duration() / -ratio;
          return lastSnap;
        },
        onRelease() {
          syncIndex();
          if (draggable.isThrowing) {
            indexIsDirty = true;
          }
        },
        onThrowComplete: () => {
          syncIndex();
          if (wasPlaying) tl.play();

          // // Clear blur effect when throw/drag completes
          // gsap.to(items, {
          //   ...CLEAR_STATE,
          //   ease: "power2.out",
          // });
          isDragging = false;
        },
      })[0];

      tl.draggable = draggable;
    }

    // ================================
    // INITIALIZATION
    // ================================

    gsap.set(items, { x: 0, force3D: true });
    populateWidths();
    populateTimeline();
    populateOffsets();
    window.addEventListener("resize", onResize);

    // ================================
    // TIMELINE METHODS
    // ================================

    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.closestIndex = (setCurrent) => {
      const index = getClosest(times, tl.time(), tl.duration());
      if (setCurrent) {
        curIndex = index;
        indexIsDirty = false;
      }
      return index;
    };
    tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex);
    tl.next = (vars) => toIndex(tl.current() + 1, vars);
    tl.previous = (vars) => toIndex(tl.current() - 1, vars);
    tl.times = times;

    // Pre-render for performance
    tl.progress(1, true).progress(0, true);

    if (config.reversed) {
      tl.vars.onReverseComplete();
      tl.reverse();
    }

    // Initialize to center the first element
    if (center && times[0] !== undefined) {
      tl.time(times[0], true);
    }

    tl.closestIndex(true);
    lastIndex = curIndex;
    if (onChange) {
      onChange(items[curIndex], curIndex);
    }

    timeline = tl;

    // Cleanup function
    return () => window.removeEventListener("resize", onResize);
  });

  return timeline;
}
