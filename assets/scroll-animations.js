/**
 * Consolidated GSAP Scroll Animations
 * Handles text scroll, video scroll, and values card animations
 */

const isMobile = () => window.innerWidth <= 480;

document.addEventListener("DOMContentLoaded", function () {
  // Register GSAP plugins
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ================================
  // TEXT SCROLL ANIMATION
  // ================================

  const splitIntoWords = (el) => {
    const original = el.textContent;
    const tokens = original.match(/(\s+|[^\s]+)/g) || [original];
    const frag = document.createDocumentFragment();
    const wordEls = [];

    tokens.forEach((tok) => {
      if (/^\s+$/.test(tok)) {
        frag.appendChild(document.createTextNode(tok));
      } else {
        const span = document.createElement("span");
        span.className = "text-scroll-animation__content__word";
        span.textContent = tok;
        frag.appendChild(span);
        wordEls.push(span);
      }
    });

    el.textContent = "";
    el.appendChild(frag);
    return wordEls;
  };

  const colorScroll = (el) => {
    const words = splitIntoWords(el);

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: el,
        start: "top 75%",
        end: "center center",
        scrub: true,
      },
    });

    tl.to(words, {
      opacity: 1,
      stagger: { amount: 1 },
    });
  };

  const initTextScrollAnimation = () => {
    document
      .querySelectorAll(".text-scroll-animation__content")
      ?.forEach(colorScroll);
    ScrollTrigger.refresh();
  };

  // ================================
  // SCROLL VIDEO ANIMATION
  // ================================

  let scrollVideoTriggers = [];
  let ticker = null;
  let videoTargets = new Map(); // Store target time for each video

  function setupScrollScrubForVideo(video) {
    if (!video) return;

    video.addEventListener("loadedmetadata", () => {
      console.log("Video metadata loaded");
      // video.load();
      const duration = video.duration;
      videoTargets.set(video, 0); // Initialize target time
      // video.load();

      try {
        const p = video.play();
        if (p?.then) p.then(() => video.pause());
      } catch (e) {
        console.error(e);
      }

      const trigger = ScrollTrigger.create({
        trigger: video,
        start: "center bottom",
        end: "top top",
        scrub: true,
        onUpdate: (self) => {
          const targetTime = self.progress * duration;
          console.log("targetTime", targetTime);

          videoTargets.set(video, targetTime);

          // Start ticker if not already running
          if (!ticker) {
            startTicker();
          }
        },
        onEnter: () => {
          console.log("onEnter");

          // Video enters scrub range from above
          videoTargets.set(video, 0);
          if (!ticker) startTicker();
        },
        onLeave: () => {
          // Video exits scrub range (scrolled past)
          video.pause();
          videoTargets.delete(video);
          if (videoTargets.size === 0) stopTicker();
        },
        onEnterBack: () => {
          // Video re-enters scrub range from below
          videoTargets.set(video, video.duration);
          if (!ticker) startTicker();
        },
        onLeaveBack: () => {
          // Video exits scrub range (scrolled back up)
          video.pause();
          videoTargets.delete(video);
          if (videoTargets.size === 0) stopTicker();
        },
      });

      console.log(trigger);

      scrollVideoTriggers.push(trigger);
    });
  }

  function startTicker() {
    if (ticker) return;

    ticker = gsap.ticker.add(updateVideoTimes);
  }

  function stopTicker() {
    if (ticker) {
      gsap.ticker.remove(updateVideoTimes);
      ticker = null;
    }
  }

  function updateVideoTimes() {
    videoTargets.forEach((targetTime, video) => {
      const currentTime = video.currentTime;
      const diff = targetTime - currentTime;

      // Use lerp for smooth interpolation
      const lerpFactor = 0.15; // Adjust for smoothness (0.1 = slower, 0.3 = faster)
      const newTime = currentTime + diff * lerpFactor;

      // Only update if difference is significant enough
      if (Math.abs(diff) > 0.01) {
        if ("requestVideoFrameCallback" in video) {
          video.currentTime = newTime;
        } else {
          video.currentTime = newTime;
        }
      }
    });

    // Stop ticker if no videos are being updated
    if (videoTargets.size === 0) {
      stopTicker();
    }
  }

  function initScrollVideos() {
    // scrollVideoTriggers.forEach((trigger) => trigger.kill());
    // scrollVideoTriggers = [];

    // Clear video targets and stop ticker
    videoTargets.clear();
    stopTicker();

    document
      .querySelectorAll(".scroll-video__container")
      .forEach((container) => {
        const desktopVideo = container.querySelector(".scroll-video__desktop");
        const mobileVideo = container.querySelector(".scroll-video__mobile");

        const activeVideo =
          window.innerWidth <= 767 ? mobileVideo : desktopVideo;

        if (activeVideo) setupScrollScrubForVideo(activeVideo);
      });
  }

  // ================================
  // VALUES CARD ANIMATION
  // ================================

  function initValuesCardAnimation() {
    const cards = document.querySelectorAll(".card-section .card");

    if (
      !cards.length ||
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined"
    ) {
      return;
    }

    // Set initial state
    gsap.set(cards, {
      opacity: 0,
      filter: "blur(10px)",
      y: 30,
      scale: 0.95,
    });

    // Create timeline with ScrollTrigger
    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
        force3D: true,
      },
      scrollTrigger: {
        trigger: ".card-section__grid",
        start: "top 70%",
        toggleActions: "play none none none",
      },
    });

    // Animate cards with stagger
    tl.to(cards, {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: {
        amount: 0.6,
        from: "start",
      },
    });
  }

  // ================================
  // INITIALIZATION
  // ================================

  // Initialize all animations
  function initAllAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.warn("GSAP or ScrollTrigger not loaded");
      return;
    }

    initTextScrollAnimation();
    initScrollVideos();
    initValuesCardAnimation();
    initLatestArticlesAnimation();
  }

  // Initialize animations
  initAllAnimations();

  // Handle resize for video animations
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initScrollVideos, 300);
  });
});

function initLatestArticlesAnimation() {
  const mobile = isMobile();
  let sections = document.querySelectorAll(".latest-articles");
  if (sections?.length) {
    sections = gsap.utils.toArray(sections);
    for (const section of sections) {
      const title = section.querySelector(".latest-articles__title");
      if (title) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: mobile ? "10% 70%" : "center 70%",
            scrub: 1,
            onLeave: () => {
              // tl.kill();
              // gsap.set(title, {
              //   color: "var(--color-brand-cream)",
              //   top: "-20px",
              //   y: "-100%",
              //   scale: 1,
              //   ease: "power2.inOut",
              //   duration: 0.2,
              // });
            },
          },
        });

        tl.fromTo(
          title,
          {
            top: "0px",
            y: "-400%",
            scale: mobile ? 1.4 : 5,
          },
          {
            top: "0px",
            y: "100%",
            scale: mobile ? 1.4 : 5,
            ease: "linear",
            duration: 0.8,
          },
          0
        ).to(
          title,
          {
            color: "var(--color-brand-cream)",
            top: "-20px",
            y: "-100%",
            scale: 1,
            ease: "power2.inOut",
            duration: 0.2,
          },
          0.8
        );
      }
    }
  }
}
