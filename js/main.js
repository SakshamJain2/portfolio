// ===================================================
// Shared site behaviors
// ===================================================

// Mobile nav toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }

  // Mark active nav link
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll(".reveal");
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
