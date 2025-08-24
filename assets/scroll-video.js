document.addEventListener("DOMContentLoaded", function () {
  let scrollVideoTriggers = [];

  function setupScrollScrubForVideo(video) {
    if (!video) return;

    video.addEventListener("loadedmetadata", () => {
      const duration = video.duration;

      try {
        const p = video.play();
        if (p?.then) p.then(() => video.pause());
      } catch (e) {}

      const scrubTrigger = ScrollTrigger.create({
        trigger: video,
        start: "center bottom",
        end: "center center",
        scrub: true,
        onUpdate: (self) => {
          const t = self.progress * duration;
          if ("requestVideoFrameCallback" in video) {
            video.currentTime = t;
          } else if (Math.abs(video.currentTime - t) > 0.03) {
            video.currentTime = t;
          }
        },
      });

      const pauseTrigger = ScrollTrigger.create({
        trigger: video,
        start: "bottom top",
        end: "top bottom",
        onLeave: () => video.pause(),
        onLeaveBack: () => video.pause(),
      });

      scrollVideoTriggers.push(scrubTrigger, pauseTrigger);
    });
  }

  function initScrollVideos() {
    scrollVideoTriggers.forEach((trigger) => trigger.kill());
    scrollVideoTriggers = [];

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

  initScrollVideos();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initScrollVideos, 300);
  });
});
