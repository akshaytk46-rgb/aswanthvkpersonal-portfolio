const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const body = document.body;
const topbar = document.querySelector('.topbar');
const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const addScrollProgress = () => {
  if (document.querySelector('.scroll-progress')) return null;

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  body.append(progress);
  return progress;
};

const forceMobileDarkMode = () => {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const themeButtons = document.querySelectorAll('.theme-btn');

  if (isMobile) {
    body.classList.add('dark-mode');
    body.dataset.mobileDarkOnly = 'true';
    themeButtons.forEach((button) => {
      button.setAttribute('aria-disabled', 'true');
      button.setAttribute('tabindex', '-1');
    });
    return;
  }

  delete body.dataset.mobileDarkOnly;
  themeButtons.forEach((button) => {
    button.removeAttribute('aria-disabled');
    button.removeAttribute('tabindex');
  });
};

document.addEventListener('click', (event) => {
  if (!body.dataset.mobileDarkOnly) return;
  const themeButton = event.target.closest('.theme-btn');
  if (!themeButton) return;

  event.preventDefault();
  event.stopPropagation();
  body.classList.add('dark-mode');
}, true);

const addCursorGlow = () => {
  if (prefersReducedMotion || window.innerWidth < 769 || document.querySelector('.cursor-glow')) return;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  body.append(glow);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let currentX = x;
  let currentY = y;

  const moveGlow = () => {
    currentX += (x - currentX) * 0.16;
    currentY += (y - currentY) * 0.16;
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    window.requestAnimationFrame(moveGlow);
  };

  window.addEventListener('pointermove', (event) => {
    x = event.clientX;
    y = event.clientY;
  }, { passive: true });

  moveGlow();
};

const addAmbientBackground = () => {
  if (document.querySelector('.ambient-bg')) return;

  const ambient = document.createElement('div');
  ambient.className = 'ambient-bg';
  ambient.setAttribute('aria-hidden', 'true');
  ambient.innerHTML = '<span></span><span></span><span></span>';
  body.prepend(ambient);
};

const lockHeaderToTop = () => {
  if (!topbar) return;

  const ambient = document.querySelector('.ambient-bg');
  if (ambient) {
    ambient.after(topbar);
    return;
  }

  body.prepend(topbar);
};

const lockDecorativeLayers = () => {
  document.querySelectorAll('.ambient-bg, .cursor-glow, .network-canvas, .scroll-progress').forEach((layer) => {
    layer.setAttribute('aria-hidden', 'true');
    layer.dataset.decorative = 'true';
  });
};

const setHeaderState = () => {
  if (!topbar) return;
  topbar.classList.toggle('is-scrolled', window.scrollY > 16);
};

const setActiveNav = () => {
  if (!sections.length) return;

  const current = sections.reduce((active, section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= 160 ? section : active;
  }, sections[0]);

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`);
  });
};

const animateStats = () => {
  const stats = document.querySelectorAll('.stat-card strong');
  if (prefersReducedMotion || !stats.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.counted === 'true') return;

      const stat = entry.target;
      const original = stat.textContent.trim();
      const match = original.match(/^(\d+)(.*)$/);
      if (!match) return;

      const target = Number(match[1]);
      const suffix = match[2] || '';
      const duration = 900;
      const start = performance.now();
      stat.dataset.counted = 'true';

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        stat.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(tick);
      observer.unobserve(stat);
    });
  }, { threshold: 0.45 });

  stats.forEach((stat) => observer.observe(stat));
};

const revealOnScroll = () => {
  const revealItems = document.querySelectorAll(
    '.hero-copy, .hero-image, .stat-card, .skill-chip, .project-card, .service-card, .timeline-card, .about-card, .contact-card'
  );

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  revealItems.forEach((item, index) => {
    item.classList.add('js-reveal');
    item.style.setProperty('--reveal-delay', `${Math.min(index * 45, 240)}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
  );

  revealItems.forEach((item) => observer.observe(item));
};

const addMagneticButtons = () => {
  if (prefersReducedMotion || window.innerWidth < 769) return;

  document.querySelectorAll('.btn, .theme-btn').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.14;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.14;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });

    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
  });
};

const addCardLight = () => {
  if (prefersReducedMotion || window.innerWidth < 769) return;

  document.querySelectorAll('.stat-card, .skill-chip, .project-card, .service-card').forEach((card) => {
    card.classList.add('has-card-light');

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--pointer-x', `${x}%`);
      card.style.setProperty('--pointer-y', `${y}%`);
    });
  });
};

const initSmoothAnchors = () => {
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  });
};

let ticking = false;
const progressBar = addScrollProgress();

const setScrollProgress = () => {
  if (!progressBar) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  progressBar.style.setProperty('--scroll-progress', `${Math.min(progress, 1) * 100}%`);
};

const handleScroll = () => {
  if (ticking) return;
  window.requestAnimationFrame(() => {
    setHeaderState();
    setActiveNav();
    setScrollProgress();
    ticking = false;
  });
  ticking = true;
};

document.documentElement.classList.add('js-ready');
forceMobileDarkMode();
addAmbientBackground();
lockHeaderToTop();
addCursorGlow();
lockDecorativeLayers();
setHeaderState();
setActiveNav();
setScrollProgress();
revealOnScroll();
addMagneticButtons();
addCardLight();
animateStats();
initSmoothAnchors();

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', () => {
  forceMobileDarkMode();
  setActiveNav();
});
