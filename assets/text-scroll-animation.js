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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTextScrollAnimation);
} else {
  initTextScrollAnimation();
}
