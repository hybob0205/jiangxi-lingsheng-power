const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.topbar nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

const loadScript = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});

async function startMotion() {
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js');
  } catch {
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();

  media.add({
    motion: '(prefers-reduced-motion: no-preference)',
    desktop: '(min-width: 900px)'
  }, (context) => {
    const { motion, desktop } = context.conditions;
    if (!motion) return;

    const hero = document.querySelector('.hero');
    if (hero) {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timeline
        .from('.hero-image', { scale: 1.08, duration: 1.35, ease: 'power2.out' })
        .from('.hero-content > *', { y: 28, autoAlpha: 0, duration: 0.72, stagger: 0.1 }, '-=0.8')
        .from(['.hero-foot', '.hero-index'], { y: 16, autoAlpha: 0, duration: 0.55, stagger: 0.1 }, '-=0.35');

      if (desktop) {
        const image = hero.querySelector('.hero-image');
        const xTo = gsap.quickTo(image, 'x', { duration: 0.8, ease: 'power3.out' });
        const yTo = gsap.quickTo(image, 'y', { duration: 0.8, ease: 'power3.out' });
        hero.addEventListener('pointermove', (event) => {
          const bounds = hero.getBoundingClientRect();
          xTo((event.clientX - bounds.left - bounds.width / 2) * 0.018);
          yTo((event.clientY - bounds.top - bounds.height / 2) * 0.014);
        });
        hero.addEventListener('pointerleave', () => {
          xTo(0);
          yTo(0);
        });
      }
    }

    gsap.from('.topbar', { y: -18, autoAlpha: 0, duration: 0.6, ease: 'power2.out' });

    const groups = [
      ['.intro-grid > div, .facts > div', 22],
      ['.section-head > *, .product-card', 26],
      ['.capability-image, .capability-panel > *', 30],
      ['.gallery-head > *, .gallery-grid figure', 26],
      ['.contact-inner > *, .contact-side', 28],
      ['.page-heading > *, .catalog-card', 24],
      ['.inner-hero-copy > *, .inner-content > *, .workshop-gallery figure', 24],
      ['.contact-page > *:not(.contact-page-bg)', 24],
      ['.product-detail > *', 24]
    ];

    groups.forEach(([selector, distance]) => {
      const targets = gsap.utils.toArray(selector);
      if (!targets.length) return;
      gsap.from(targets, {
        y: distance,
        autoAlpha: 0,
        duration: 0.72,
        stagger: 0.09,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: targets[0].parentElement,
          start: 'top 82%',
          once: true
        }
      });
    });
  });
}

startMotion();
