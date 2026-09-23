function setupNavigationMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.topbar nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}
setupNavigationMenu();

let pageRequest = 0;
async function navigateToPage(url, addHistory = true) {
  const requestId = ++pageRequest;
  try {
    const response = await fetch(url.href, { headers: { Accept: 'text/html' } });
    if (!response.ok) throw new Error('Page request failed');
    const markup = await response.text();
    if (requestId !== pageRequest) return;
    const nextDocument = new DOMParser().parseFromString(markup, 'text/html');
    const nextHeader = nextDocument.querySelector('.topbar');
    const nextMain = nextDocument.querySelector('main');
    const nextFooter = nextDocument.querySelector('footer');
    const currentHeader = document.querySelector('.topbar');
    const currentMain = document.querySelector('main');
    const currentFooter = document.querySelector('footer');
    if (!nextHeader || !nextMain || !currentHeader || !currentMain) throw new Error('Page structure missing');

    if (window.ScrollTrigger) window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    currentHeader.replaceWith(nextHeader);
    currentMain.replaceWith(nextMain);
    if (nextFooter && currentFooter) currentFooter.replaceWith(nextFooter);
    document.title = nextDocument.title;
    if (addHistory) history.pushState({ sitePage: true }, '', url.href);
    setupNavigationMenu();
    window.scrollTo(0, 0);
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.gsap.fromTo(nextMain, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power2.out' });
    }
  } catch {
    window.location.href = url.href;
  }
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.target || link.hasAttribute('download')) return;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin || !/\.html$/i.test(url.pathname)) return;
  if (url.pathname === window.location.pathname && url.hash) return;
  if (url.pathname === window.location.pathname && !url.hash) return;
  event.preventDefault();
  navigateToPage(url);
});
history.scrollRestoration = 'manual';
window.addEventListener('popstate', () => navigateToPage(new URL(window.location.href), false));

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

/* Two-track background music player. Browsers may block sound autoplay until a user gesture. */
function setupBackgroundMusic() {
  const tracks = [
    { title: '全是爱', src: '凤凰传奇 - 全是爱.mp3' },
    { title: '为情所伤', src: '庄心妍 - 为情所伤.mp3' }
  ];
  const player = document.createElement('section');
  player.className = 'music-control';
  player.setAttribute('aria-label', '背景音乐控制');
  player.innerHTML = `
    <div class="music-panel" hidden>
      <div class="music-panel-head"><span class="music-kicker">BACKGROUND MUSIC</span><button class="music-close" type="button" aria-label="收起音乐控制">×</button></div>
      <label class="music-track-label" for="music-track">播放曲目</label>
      <select id="music-track" class="music-track">${tracks.map((track, index) => `<option value="${index}">${track.title}</option>`).join('')}</select>
      <div class="music-panel-actions"><button class="music-prev" type="button" aria-label="上一首">上一首</button><button class="music-play" type="button">播放</button><button class="music-next" type="button" aria-label="下一首">下一首</button></div>
      <label class="music-volume-label" for="music-volume"><span>音量</span><span class="music-volume-value">25%</span></label>
      <input id="music-volume" class="music-volume" type="range" min="0" max="1" step="0.01" value="0.25">
      <p class="music-note" aria-live="polite">点击圆形按钮开始播放</p>
    </div>
    <audio class="music-audio" preload="metadata"></audio>
    <button class="music-orb" type="button" aria-expanded="false" aria-label="展开音乐控制并播放"><span class="music-orb-icon" aria-hidden="true">♫</span><span class="music-orb-pulse" aria-hidden="true"></span></button>`;
  document.body.append(player);

  const audio = player.querySelector('.music-audio');
  const orb = player.querySelector('.music-orb');
  const panel = player.querySelector('.music-panel');
  const close = player.querySelector('.music-close');
  const select = player.querySelector('.music-track');
  const play = player.querySelector('.music-play');
  const note = player.querySelector('.music-note');
  const volume = player.querySelector('.music-volume');
  const volumeLabel = player.querySelector('.music-volume-value');
  let index = 0;

  function setTrack(nextIndex, autoplay = false) {
    index = (nextIndex + tracks.length) % tracks.length;
    audio.src = tracks[index].src;
    select.value = String(index);
    note.textContent = `正在播放：${tracks[index].title}`;
    if (autoplay) playAudio();
  }
  async function playAudio() {
    try {
      await audio.play();
      player.classList.add('is-playing');
      play.textContent = '暂停';
      orb.setAttribute('aria-label', '暂停背景音乐');
      note.textContent = `正在播放：${tracks[index].title}`;
    } catch {
      player.classList.remove('is-playing');
      play.textContent = '播放';
      note.textContent = '浏览器拦截了自动播放，请点击圆形按钮开始';
    }
  }
  function pauseAudio() {
    audio.pause();
    player.classList.remove('is-playing');
    play.textContent = '播放';
    orb.setAttribute('aria-label', '展开音乐控制并播放');
    note.textContent = `已暂停：${tracks[index].title}`;
  }
  function togglePanel(force) {
    const expanded = force ?? panel.hidden;
    panel.hidden = !expanded;
    orb.setAttribute('aria-expanded', String(expanded));
    orb.setAttribute('aria-label', expanded ? '收起音乐控制' : '展开音乐控制并播放');
    if (!expanded) orb.focus();
  }
  async function togglePlayback() {
    if (audio.paused) await playAudio(); else pauseAudio();
  }
  orb.addEventListener('click', async () => {
    const expanded = !panel.hidden;
    togglePanel(!expanded);
    if (!expanded && audio.paused) await playAudio();
  });
  close.addEventListener('click', () => togglePanel(false));
  play.addEventListener('click', togglePlayback);
  player.querySelector('.music-prev').addEventListener('click', () => setTrack(index - 1, true));
  player.querySelector('.music-next').addEventListener('click', () => setTrack(index + 1, true));
  select.addEventListener('change', () => setTrack(Number(select.value), !audio.paused));
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
    volumeLabel.textContent = `${Math.round(audio.volume * 100)}%`;
  });
  audio.volume = Number(volume.value);
  audio.addEventListener('ended', () => setTrack(index + 1, true));
  audio.addEventListener('error', () => {
    note.textContent = `音频文件暂不可用：${tracks[index].title}`;
    player.classList.remove('is-playing');
  });
  audio.addEventListener('play', () => {
    player.classList.add('is-playing');
    play.textContent = '暂停';
    orb.setAttribute('aria-label', '暂停背景音乐');
  });
  audio.addEventListener('pause', () => {
    player.classList.remove('is-playing');
    play.textContent = '播放';
  });

  setTrack(0);
  // Attempt on entry; the browser will reject this if sound autoplay is not allowed.
  playAudio();
}

setupBackgroundMusic();
