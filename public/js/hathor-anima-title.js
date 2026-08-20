/**
 * Suites anima__title for iframe pages (accommodation Springs).
 * Clipped lines, opposing letter travel, stagger 0.05, 0.75s, power3.out.
 */
(function hathorAnimaTitle() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";
  var SELECTORS = [
    "[data-anima-title]",
    'h1[data-reveal="title"]',
    'h1[data-reveal="text"]',
    'h2[data-reveal="title"]',
    'h2[data-reveal="text"]',
    "h1.g1",
    "h2.h0",
    "h2.h1",
    ".lux-footer__headline",
  ];

  function skip(el) {
    if (el.getAttribute("data-anima-bound") === "1") return true;
    if (el.closest("nav, header, footer, button, a.btn, .btn")) return true;
    if (!(el.textContent || "").trim()) return true;
    return false;
  }

  function splitHost(el) {
    if (el.querySelector(".anima-split-char")) return;
    var html = el.innerHTML;
    var parts = html.split(/<br\s*\/?>/i);
    el.textContent = "";
    parts.forEach(function (part, index) {
      var line = document.createElement("span");
      line.className = "anima-split-line";
      line.style.display = "block";
      line.style.overflow = "hidden";
      var text = part.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ");
      var direction = index % 2 === 0 ? 1 : -1;
      Array.from(text).forEach(function (ch) {
        if (ch === " ") {
          line.appendChild(document.createTextNode("\u00a0"));
          return;
        }
        var span = document.createElement("span");
        span.className = "anima-split-char";
        span.textContent = ch;
        span.style.display = "inline-block";
        span.style.transform = "translate3d(0," + direction * 110 + "%,0)";
        line.appendChild(span);
      });
      el.appendChild(line);
    });
  }

  function play(el) {
    if (el.getAttribute("data-anima-played") === "1") return;
    el.setAttribute("data-anima-played", "1");
    var lines = el.querySelectorAll(".anima-split-line");
    lines.forEach(function (line, lineIndex) {
      var chars = line.querySelectorAll(".anima-split-char");
      var fromY = lineIndex % 2 !== 0 ? "-110%" : "110%";
      chars.forEach(function (char, charIndex) {
        char.animate(
          [
            { transform: "translate3d(0," + fromY + ",0)" },
            { transform: "translate3d(0,0,0)" },
          ],
          {
            duration: 750,
            delay: Math.max(0, lineIndex * 350) + charIndex * 50,
            easing: EASE,
            fill: "forwards",
          },
        );
      });
    });
  }

  function bind(el) {
    el.setAttribute("data-anima-bound", "1");
    el.removeAttribute("data-reveal");
    splitHost(el);
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          play(el);
          io.disconnect();
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
  }

  function run() {
    var seen = [];
    SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (node) {
        if (!(node instanceof HTMLElement)) return;
        if (seen.indexOf(node) !== -1) return;
        if (skip(node)) return;
        seen.push(node);
        bind(node);
      });
    });
  }

  run();
})();
