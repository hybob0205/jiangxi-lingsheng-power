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

/* Original, browser-synthesized background music. Playback starts only on request. */
function setupBackgroundMusic() {
  const tunes = [
    {
      name: '晨光微风', bpm: 82,
      notes: [76, null, 79, 81, null, 79, 76, null, 74, null, 76, 79, null, 76, 72, null,
        72, null, 76, 79, null, 81, 79, null, 76, null, 74, 72, null, 74, 76, null],
      chords: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
    },
    {
      name: '林间漫步', bpm: 76,
      notes: [72, null, 76, null, 79, null, 76, 74, null, 76, null, 79, 84, null, 79, null,
        76, null, 72, 74, null, 76, 79, null, 74, null, 71, null, 67, null, 71, null],
      chords: [[60, 63, 67], [58, 62, 65], [55, 58, 62], [57, 60, 64]]
    },
    {
      name: '午后晴空', bpm: 88,
      notes: [74, 77, null, 81, 79, null, 77, 74, null, 72, 74, null, 77, 81, null, 84,
        81, null, 79, 77, null, 74, 72, null, 74, null, 77, 79, null, 77, 74, null],
      chords: [[62, 65, 69], [57, 60, 64], [55, 59, 62], [60, 64, 67]]
    }
  ];

  const player = document.createElement('section');
  player.className = 'music-control';
  player.setAttribute('aria-label', '背景音乐控制');
  player.innerHTML = `
    <div class="music-settings" hidden>
      <label class="music-track-label" for="music-track">选择曲目</label>
      <select id="music-track" class="music-track">
        ${tunes.map((tune, index) => `<option value="${index}">${tune.name}</option>`).join('')}
      </select>
      <label class="music-volume-label" for="music-volume"><span>音量</span><span class="music-volume-value">25%</span></label>
      <input id="music-volume" class="music-volume" type="range" min="0" max="0.5" step="0.01" value="0.25">
      <p class="music-note">原创合成旋律，无外部音频素材</p>
    </div>
    <div class="music-actions">
      <button class="music-toggle" type="button" aria-pressed="false"><span class="music-symbol" aria-hidden="true">♫</span><span class="music-status">播放音乐</span></button>
      <button class="music-settings-toggle" type="button" aria-expanded="false" aria-label="展开音乐设置">调节</button>
    </div>`;
  document.body.append(player);

  const playButton = player.querySelector('.music-toggle');
  const playLabel = player.querySelector('.music-status');
  const settingsButton = player.querySelector('.music-settings-toggle');
  const settings = player.querySelector('.music-settings');
  const trackSelect = player.querySelector('.music-track');
  const volumeInput = player.querySelector('.music-volume');
  const volumeLabel = player.querySelector('.music-volume-value');

  let audioContext;
  let masterGain;
  let reverb;
  let scheduler;
  let nextNoteTime = 0;
  let step = 0;
  let active = false;
  let trackIndex = 0;

  try {
    trackIndex = Number(localStorage.getItem('lingsheng-music-track') || 0);
    volumeInput.value = localStorage.getItem('lingsheng-music-volume') || '0.25';
  } catch { /* Storage can be unavailable in private browser modes. */ }
  if (!Number.isInteger(trackIndex) || trackIndex < 0 || trackIndex >= tunes.length) trackIndex = 0;
  trackSelect.value = String(trackIndex);
  updateVolumeLabel();

  function updateVolumeLabel() {
    volumeLabel.textContent = `${Math.round(Number(volumeInput.value) * 100)}%`;
  }

  function initializeAudio() {
    if (audioContext) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('此浏览器不支持网页音频');
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.value = Number(volumeInput.value);
    const dry = audioContext.createGain();
    const wet = audioContext.createGain();
    dry.gain.value = 0.82;
    wet.gain.value = 0.18;
    reverb = audioContext.createConvolver();
    const length = Math.floor(audioContext.sampleRate * 1.7);
    const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.2);
      }
    }
    reverb.buffer = impulse;
    masterGain.connect(dry).connect(audioContext.destination);
    masterGain.connect(reverb).connect(wet).connect(audioContext.destination);
  }

  function frequency(note) { return 440 * Math.pow(2, (note - 69) / 12); }

  function playPluck(note, time) {
    const oscillator = audioContext.createOscillator();
    const overtone = audioContext.createOscillator();
    const tone = audioContext.createBiquadFilter();
    const envelope = audioContext.createGain();
    const base = frequency(note);
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(base, time);
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(base * 2.01, time);
    tone.type = 'lowpass';
    tone.frequency.setValueAtTime(2500, time);
    tone.frequency.exponentialRampToValueAtTime(780, time + 0.65);
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(0.11, time + 0.018);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.72);
    oscillator.connect(tone);
    overtone.connect(tone);
    tone.connect(envelope).connect(masterGain);
    oscillator.start(time);
    overtone.start(time);
    oscillator.stop(time + 0.74);
    overtone.stop(time + 0.74);
  }

  function playChord(notes, time, duration) {
    notes.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      const envelope = audioContext.createGain();
      const tone = audioContext.createBiquadFilter();
      oscillator.type = index === 1 ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency(note), time);
      tone.type = 'lowpass';
      tone.frequency.value = 900;
      envelope.gain.setValueAtTime(0.0001, time);
      envelope.gain.exponentialRampToValueAtTime(0.027, time + 0.42);
      envelope.gain.setValueAtTime(0.025, time + Math.max(0.5, duration - 0.48));
      envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(tone).connect(envelope).connect(masterGain);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.03);
    });
  }

  function scheduleStep() {
    const tune = tunes[trackIndex];
    const beat = 60 / tune.bpm;
    const time = nextNoteTime;
    if (step % 8 === 0) playChord(tune.chords[(step / 8) % tune.chords.length], time, beat * 7.8);
    const note = tune.notes[step % tune.notes.length];
    if (note) playPluck(note, time);
    if (step % 8 === 0) playPluck(tune.chords[(step / 8) % tune.chords.length][0] - 12, time);
    nextNoteTime += beat / 2;
    step += 1;
  }

  function startScheduler() {
    window.clearInterval(scheduler);
    step = 0;
    nextNoteTime = audioContext.currentTime + 0.08;
    scheduler = window.setInterval(() => {
      while (nextNoteTime < audioContext.currentTime + 0.12) scheduleStep();
    }, 25);
  }

  async function togglePlayback() {
    try {
      initializeAudio();
      if (active) {
        active = false;
        window.clearInterval(scheduler);
        await audioContext.suspend();
        playLabel.textContent = '播放音乐';
        playButton.setAttribute('aria-pressed', 'false');
        player.classList.remove('is-playing');
      } else {
        await audioContext.resume();
        active = true;
        startScheduler();
        playLabel.textContent = '暂停音乐';
        playButton.setAttribute('aria-pressed', 'true');
        player.classList.add('is-playing');
      }
    } catch (error) {
      playLabel.textContent = error.message || '无法播放';
      playButton.setAttribute('aria-pressed', 'false');
    }
  }

  playButton.addEventListener('click', togglePlayback);
  settingsButton.addEventListener('click', () => {
    const expanded = settingsButton.getAttribute('aria-expanded') === 'true';
    settingsButton.setAttribute('aria-expanded', String(!expanded));
    settingsButton.setAttribute('aria-label', expanded ? '展开音乐设置' : '收起音乐设置');
    settings.hidden = expanded;
  });
  trackSelect.addEventListener('change', () => {
    trackIndex = Number(trackSelect.value);
    try { localStorage.setItem('lingsheng-music-track', String(trackIndex)); } catch { /* Ignore unavailable storage. */ }
    if (active) startScheduler();
  });
  volumeInput.addEventListener('input', () => {
    updateVolumeLabel();
    if (masterGain && audioContext) masterGain.gain.setTargetAtTime(Number(volumeInput.value), audioContext.currentTime, 0.08);
    try { localStorage.setItem('lingsheng-music-volume', volumeInput.value); } catch { /* Ignore unavailable storage. */ }
  });
}

setupBackgroundMusic();
