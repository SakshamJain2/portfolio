// ===================================================
// Shared site behaviors
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Mobile nav toggle ----
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }

  // ---- Mark active nav link ----
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  // ---- Scroll progress bar ----
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);
  const navbar = document.querySelector(".navbar");

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = pct + "%";

    if (navbar) {
      navbar.classList.toggle("scrolled", scrollTop > 20);
    }

    // Hero parallax
    const heroTerminal = document.querySelector(".hero .terminal");
    if (heroTerminal && scrollTop < window.innerHeight) {
      heroTerminal.style.transform = `translateY(${scrollTop * 0.08}px)`;
    }
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Scroll reveal (supports .reveal and .stagger) ----
  const revealEls = document.querySelectorAll(".reveal, .stagger");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  // ---- Animated counters ----
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = el.getAttribute("data-counter");
    const match = target.match(/^([\d.]+)(.*)$/);
    if (!match) { el.textContent = target; return; }
    const endVal = parseFloat(match[1]);
    const suffix = match[2] || "";
    const isDecimal = match[1].includes(".");
    const duration = 1200;
    const startTime = performance.now();

    if (reduceMotion) {
      el.textContent = target;
      return;
    }

    function tick(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const current = endVal * eased;
      el.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---- Cursor glow (desktop only) ----
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    let glowActive = false;
    document.addEventListener("mousemove", (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
      if (!glowActive) {
        glow.classList.add("active");
        glowActive = true;
      }
    });
    document.addEventListener("mouseleave", () => {
      glow.classList.remove("active");
      glowActive = false;
    });
  }

  // ---- Card tilt-glow tracking ----
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", x + "%");
      card.style.setProperty("--my", y + "%");
    });
  });

  // ---- Page transitions ----
  if (!reduceMotion) {
    const overlay = document.createElement("div");
    overlay.className = "page-transition enter";
    document.body.appendChild(overlay);
    overlay.addEventListener("animationend", () => overlay.remove());

    document.querySelectorAll('a[href$=".html"]').forEach((a) => {
      // only same-site, non-target=_blank links
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      a.addEventListener("click", (e) => {
        e.preventDefault();
        const exitOverlay = document.createElement("div");
        exitOverlay.className = "page-transition exit";
        document.body.appendChild(exitOverlay);
        exitOverlay.addEventListener("animationend", () => {
          window.location.href = a.href;
        });
      });
    });
  }
});

// Terminal typing animation (used on home page hero)
function typeTerminal(elementId, lines, opts = {}) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const speed = opts.speed || 22;
  const lineDelay = opts.lineDelay || 250;

  el.innerHTML = "";
  let lineIndex = 0;

  function typeLine() {
    if (lineIndex >= lines.length) {
      // leave a blinking cursor at the end
      const cursor = document.createElement("span");
      cursor.className = "term-cursor";
      el.appendChild(cursor);
      return;
    }
    const lineData = lines[lineIndex];
    const lineEl = document.createElement("div");
    lineEl.className = "line";
    el.appendChild(lineEl);

    if (lineData.type === "cmd") {
      // type out character by character
      const prompt = document.createElement("span");
      prompt.className = "prompt-char";
      prompt.textContent = "$ ";
      lineEl.appendChild(prompt);
      const cmdSpan = document.createElement("span");
      cmdSpan.className = "cmd";
      lineEl.appendChild(cmdSpan);

      let charIndex = 0;
      const text = lineData.text;
      const typer = setInterval(() => {
        cmdSpan.textContent += text[charIndex];
        charIndex++;
        if (charIndex >= text.length) {
          clearInterval(typer);
          lineIndex++;
          setTimeout(typeLine, lineDelay);
        }
      }, speed);
    } else {
      // output line - render instantly (can contain HTML)
      lineEl.className = "line out";
      lineEl.innerHTML = lineData.html || lineData.text;
      lineIndex++;
      setTimeout(typeLine, lineDelay / 4);
    }
  }

  typeLine();
}
