const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", () => {
  const nav = $("#nav");
  const progress = $(".scroll-progress");
  const menuToggle = $(".menu-toggle");
  const navLinks = $(".nav-links");

  // Navigation state
  const updateScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 30);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  updateScroll();
  window.addEventListener("scroll", updateScroll, { passive: true });

  // Mobile menu
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.classList.toggle("open");
    navLinks.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  $$(".nav-links a").forEach(link => link.addEventListener("click", () => {
    menuToggle.classList.remove("open");
    navLinks.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));

  // Scroll reveal
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 5, 4) * 70}ms`;
    observer.observe(el);
  });

  // Typewriter
  const typeEl = $("#typewriter");
  const words = ["ASWIN KRISHNAN", "BATRECON", "A BUILDER", "A CYBERSECURITY ENTHUSIAST"];
  let wordIndex = 0, charIndex = 0, deleting = false;

  function type() {
    const word = words[wordIndex];
    typeEl.textContent = deleting ? word.slice(0, --charIndex) : word.slice(0, ++charIndex);

    let speed = deleting ? 45 : 90;
    if (!deleting && charIndex === word.length) {
      speed = 1500;
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 350;
    }
    setTimeout(type, speed);
  }
  setTimeout(type, 500);

  // Parallax
  const parallax = $$(".parallax");
  const runParallax = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const y = window.scrollY;
    parallax.forEach(el => {
      const speed = Number(el.dataset.speed || .1);
      el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });
  };
  window.addEventListener("scroll", runParallax, { passive: true });

  // 3D tilt
  $$(".tilt").forEach(card => {
    card.addEventListener("pointermove", e => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * 7;
      const ry = (x - 0.5) * 7;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener("pointerleave", () => card.style.transform = "");
  });

  // Magnetic buttons and custom cursor
  const dot = $(".cursor-dot");
  const ring = $(".cursor-ring");
  let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  window.addEventListener("pointermove", e => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });
  const cursorLoop = () => {
    ringX += (mouseX - ringX) * .14;
    ringY += (mouseY - ringY) * .14;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(cursorLoop);
  };
  cursorLoop();

  $$(".magnetic").forEach(el => {
    el.addEventListener("pointerenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("pointerleave", () => {
      document.body.classList.remove("cursor-hover");
      el.style.transform = "";
    });
    el.addEventListener("pointermove", e => {
      if (window.innerWidth < 900) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) * .16;
      const y = (e.clientY - (rect.top + rect.height / 2)) * .16;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  // Particle field, lightweight canvas implementation
  const canvas = $("#particles");
  const ctx = canvas.getContext("2d");
  let particles = [];
  function resizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(95, Math.floor(innerWidth / 14));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.5 + .4,
      vx: (Math.random() - .5) * .25,
      vy: (Math.random() - .5) * .25
    }));
  }
  function drawParticles() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = innerWidth;
      if (p.x > innerWidth) p.x = 0;
      if (p.y < 0) p.y = innerHeight;
      if (p.y > innerHeight) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.45)";
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 115) {
          ctx.strokeStyle = `rgba(255,42,42,${(1 - d / 115) * .09})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(drawParticles);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  drawParticles();
});
