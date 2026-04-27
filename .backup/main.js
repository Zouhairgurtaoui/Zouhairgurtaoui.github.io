// ============================================================
// MAIN.JS — Portfolio interactivity
// ============================================================
// This file handles:
//   • Dynamic rendering of projects & writeups from data.js
//   • Dark / Light theme toggle with localStorage persistence
//   • Scroll-spy active nav highlighting
//   • Smooth reveal animations (IntersectionObserver)
//   • Back-to-top button visibility
//   • Mobile navigation toggle
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // ─── Render Projects ────────────────────────────────────
  renderProjects();
  renderWriteups();
  initThemeToggle();
  initScrollSpy();
  initRevealAnimations();
  initBackToTop();
  initMobileNav();
  initNavScroll();
});

/* ═══════════════════════════════════════════════════════════
   RENDER PROJECTS — builds cards from data.js array
   ═══════════════════════════════════════════════════════════ */
function renderProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid || typeof projects === "undefined") return;

  grid.innerHTML = projects
    .map(
      (p, i) => `
    <div class="project-card ${p.featured ? "featured" : ""} reveal reveal-delay-${(i % 4) + 1}">
      <div class="project-header">
        <div class="project-icon">📂</div>
        <div class="project-links">
          ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener" class="project-link" aria-label="GitHub repo for ${p.title}">⟨/⟩</a>` : ""}
          ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener" class="project-link" aria-label="Live demo for ${p.title}">↗</a>` : ""}
        </div>
      </div>
      <h3 class="project-title">${p.title}</h3>
      <p class="project-description">${p.description}</p>
      <div class="project-tech">
        ${p.tech.map((t) => `<span class="tech-badge">${t}</span>`).join("")}
      </div>
    </div>
  `
    )
    .join("");
}

/* ═══════════════════════════════════════════════════════════
   RENDER WRITEUPS — builds cards from data.js array
   ═══════════════════════════════════════════════════════════ */
function renderWriteups() {
  const grid = document.getElementById("writeups-grid");
  if (!grid || typeof writeups === "undefined") return;

  grid.innerHTML = writeups
    .map(
      (w, i) => `
    <a href="${w.link}" ${w.link.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} class="writeup-card reveal reveal-delay-${(i % 4) + 1}">
      <div class="writeup-meta">
        <span class="writeup-category">${w.category}</span>
        <span class="writeup-date">${formatDate(w.date)}</span>
      </div>
      <h3 class="writeup-title">${w.title}</h3>
      <p class="writeup-description">${w.description}</p>
      <span class="writeup-read">Read more <span class="arrow">→</span></span>
    </a>
  `
    )
    .join("");
}

/** Format date to readable string */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ═══════════════════════════════════════════════════════════
   THEME TOGGLE — dark ↔ light with localStorage
   ═══════════════════════════════════════════════════════════ */
function initThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  // Restore saved theme
  const saved = localStorage.getItem("theme");
  if (saved) {
    document.documentElement.setAttribute("data-theme", saved);
    updateToggleIcon(toggle, saved);
  }

  toggle.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateToggleIcon(toggle, next);
  });
}

function updateToggleIcon(btn, theme) {
  btn.textContent = theme === "dark" ? "☀️" : "🌙";
  btn.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
}

/* ═══════════════════════════════════════════════════════════
   SCROLL-SPY — highlight active nav link
   ═══════════════════════════════════════════════════════════ */
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link[data-section]");
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.dataset.section === id);
          });
        }
      });
    },
    {
      rootMargin: "-30% 0px -70% 0px",
    }
  );

  sections.forEach((s) => observer.observe(s));
}

/* ═══════════════════════════════════════════════════════════
   REVEAL ANIMATIONS — fade-in on scroll
   ═══════════════════════════════════════════════════════════ */
function initRevealAnimations() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // only animate once
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   BACK-TO-TOP BUTTON
   ═══════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 500);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ═══════════════════════════════════════════════════════════
   MOBILE NAV
   ═══════════════════════════════════════════════════════════ */
function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    links.classList.toggle("open");
  });

  // Close mobile nav on link click
  links.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.classList.remove("active");
      links.classList.remove("open");
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   NAV SCROLL EFFECT — add shadow on scroll
   ═══════════════════════════════════════════════════════════ */
function initNavScroll() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);
  });
}
