/* =========================================================
   AUDIO ENGINE
   ========================================================= */
let isMuted = false;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx;

function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playTone(freq, type='sine', duration=0.08, volume=0.15) {
  if (isMuted) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = type; osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime); osc.stop(c.currentTime + duration);
  } catch(e){}
}

function playPop()      { playTone(800, 'sine', 0.07, 0.2); }
function playClick()    { playTone(440, 'square', 0.05, 0.1); playTone(660, 'sine', 0.08, 0.1); }
function playCollect()  { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.1,0.15),i*60)); }
function playSuccess()  { [523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.12,0.2),i*80)); }
function playHover()    { playTone(600, 'sine', 0.04, 0.07); }

function toggleMute() {
  isMuted = !isMuted;
  document.getElementById('mute-btn').textContent = isMuted ? '🔇' : '🔊';
  showToast(isMuted ? '🔇 Sound OFF' : '🔊 Sound ON');
  if (!isMuted) playClick();
}

function showToast(msg) {
  const t = document.getElementById('mute-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

/* =========================================================
   CUSTOM CURSOR
   ========================================================= */
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});
document.addEventListener('mousedown', () => {
  cursor.classList.add('clicking');
  playPop();
});
document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

// Hover sounds for interactive elements
document.querySelectorAll('a, button, .powerup-card, .arcade-card').forEach(el => {
  el.addEventListener('mouseenter', () => playHover());
});

/* =========================================================
   STARS BACKGROUND
   ========================================================= */
const starsContainer = document.getElementById('stars-bg');
for (let i = 0; i < 80; i++) {
  const star = document.createElement('div');
  star.className = 'star';
  const size = Math.random() * 3 + 1;
  star.style.cssText = `
    width:${size}px; height:${size}px;
    left:${Math.random()*100}%;
    top:${Math.random()*80}%;
    --d:${Math.random()*4+2}s;
    animation-delay:${Math.random()*5}s;
  `;
  starsContainer.appendChild(star);
}

/* =========================================================
   MARQUEE STRIP
   ========================================================= */
const items = ['Full-Stack Dev','UI Designer','Problem Solver','Coffee Addict','Flutter Dev','Laravel Expert','JavaScript Wizard','Open Source','Tech Enthusiast','Game Dev Hobbyist'];
const track = document.getElementById('marquee-track');
// Duplicate for seamless loop
[...items,...items,...items].forEach(item => {
  const el = document.createElement('span');
  el.className = 'marquee-item';
  el.innerHTML = `<span>★</span>${item}`;
  track.appendChild(el);
});

/* =========================================================
   TYPING EFFECT
   ========================================================= */
const roles = ['Full-Stack Developer','Cyber Security','Game Developer','Data Analyst',];
let roleIdx = 0, charIdx = 0, isDeleting = false;
const typingEl = document.getElementById('typing-text');

function typeRole() {
  const current = roles[roleIdx];
  if (isDeleting) {
    typingEl.textContent = current.substring(0, charIdx--);
    if (charIdx < 0) { isDeleting = false; roleIdx = (roleIdx + 1) % roles.length; setTimeout(typeRole, 400); return; }
    setTimeout(typeRole, 50);
  } else {
    typingEl.textContent = current.substring(0, charIdx++);
    if (charIdx > current.length) { isDeleting = true; setTimeout(typeRole, 2000); return; }
    setTimeout(typeRole, 80);
  }
}
setTimeout(typeRole, 1000);

/* =========================================================
   SCROLL REVEAL
   ========================================================= */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Animate XP bars
      entry.target.querySelectorAll('.xp-fill[data-width]').forEach(bar => {
        setTimeout(() => {
          bar.style.width = bar.dataset.width;
          if (bar.dataset.color) bar.style.background = bar.dataset.color;
        }, 300);
      });
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// Also trigger XP bars that are already in parent .reveal elements
document.querySelectorAll('.xp-fill[data-width]').forEach(bar => {
  const parentReveal = bar.closest('.reveal');
  if (!parentReveal) {
    bar.style.width = bar.dataset.width;
  }
});

/* =========================================================
   ACTIVE NAV ON SCROLL
   ========================================================= */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#hud nav a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`#hud nav a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

/* =========================================================
   PLAY BUTTON WIPE TRANSITION
   ========================================================= */
document.getElementById('play-btn').addEventListener('click', function(e) {
  e.preventDefault();
  playSuccess();
  const wipe = document.getElementById('wipe-overlay');
  wipe.classList.add('wipe-in');
  setTimeout(() => {
    document.getElementById('projects').scrollIntoView({ behavior: 'instant' });
    setTimeout(() => {
      wipe.classList.remove('wipe-in');
      wipe.classList.add('wipe-out');
      setTimeout(() => wipe.classList.remove('wipe-out'), 600);
    }, 200);
  }, 400);
});

/* Wipe on nav clicks */
document.querySelectorAll('#hud nav a').forEach(link => {
  link.addEventListener('click', function(e) {
    const target = this.getAttribute('href');
    if (target === '#home') return;
    e.preventDefault();
    playClick();
    const wipe = document.getElementById('wipe-overlay');
    wipe.style.background = ['#FFD93D','#FF6B35','#A855F7','#06B6D4','#22C55E'][Math.floor(Math.random()*5)];
    wipe.classList.add('wipe-in');
    setTimeout(() => {
      document.querySelector(target).scrollIntoView({ behavior: 'instant' });
      setTimeout(() => {
        wipe.classList.remove('wipe-in');
        wipe.classList.add('wipe-out');
        setTimeout(() => wipe.classList.remove('wipe-out'), 600);
      }, 150);
    }, 400);
  });
});

/* =========================================================
   POWERUP COLLECT
   ========================================================= */
function collectPowerUp(card, emoji) {
  playCollect();
  // Sparkle effect
  for (let i = 0; i < 5; i++) {
    const spark = document.createElement('div');
    spark.className = 'sparkle';
    spark.textContent = ['✨','⭐','💫','🌟'][Math.floor(Math.random()*4)];
    spark.style.cssText = `left:${20+Math.random()*60}%;top:${30+Math.random()*30}%;animation-delay:${i*0.1}s`;
    card.appendChild(spark);
    setTimeout(() => spark.remove(), 800);
  }
  // Bounce
  card.style.transform = 'translate(-4px,-4px) rotate(-2deg) scale(1.15)';
  setTimeout(() => card.style.transform = '', 300);
}

/* =========================================================
   CONTACT FORM
   ========================================================= */
function handleSubmit(e) {
  e.preventDefault();
  playSuccess();

  // Fireworks!
  launchFireworks();

  setTimeout(() => {
    document.getElementById('success-overlay').classList.add('show');
    e.target.reset();
  }, 300);
}

function closeSuccess() {
  document.getElementById('success-overlay').classList.remove('show');
  playClick();
}

/* =========================================================
   FIREWORKS
   ========================================================= */
function launchFireworks() {
  const colors = ['#FFD93D','#FF6B35','#22C55E','#06B6D4','#A855F7','#FF6B9D','#3B82F6'];

  for (let f = 0; f < 8; f++) {
    setTimeout(() => {
      const fw = document.createElement('div');
      fw.className = 'firework';
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 60;
      fw.style.cssText = `left:${x}%;top:${y}%;`;

      for (let p = 0; p < 16; p++) {
        const particle = document.createElement('div');
        particle.className = 'fw-particle';
        const angle = (p / 16) * 360;
        const dist = 60 + Math.random() * 80;
        const rad = angle * Math.PI / 180;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist;
        particle.style.cssText = `
          background:${colors[Math.floor(Math.random()*colors.length)]};
          --tx:${tx}px; --ty:${ty}px;
          --d:${0.5+Math.random()*0.5}s;
          animation-delay:${Math.random()*0.1}s;
        `;
        fw.appendChild(particle);
      }

      document.body.appendChild(fw);
      if (!isMuted) playCollect();
      setTimeout(() => fw.remove(), 1200);
    }, f * 200);
  }
}

/* =========================================================
   IDLE CHARACTER — speech bubble messages
   ========================================================= */
const bubbleMessages = [
  'Let\'s build something! 🚀',
  'Hire me? 😄',
  'Coffee = Code ☕',
  'Bugs? What bugs? 🐛',
  'git commit -m "magic" ✨',
  'Currently: In Flow 🎯',
];
let msgIdx = 0;
const bubble = document.querySelector('.speech-bubble');
setInterval(() => {
  if (bubble) {
    bubble.style.opacity = '0';
    bubble.style.transform = 'scale(0.8)';
    setTimeout(() => {
      msgIdx = (msgIdx + 1) % bubbleMessages.length;
      bubble.textContent = bubbleMessages[msgIdx];
      bubble.style.opacity = '1';
      bubble.style.transform = 'scale(1)';
      bubble.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }, 300);
  }
}, 3500);

/* =========================================================
   PROJECT CATEGORY FILTER
   ========================================================= */
const bannerMeta = {
  all:       { icon:'🎮', title:'Semua Project',        desc:'Menampilkan semua kategori', color:'banner-all',       bgDot:'#A855F7' },
  gamedev:   { icon:'👾', title:'Game Dev Dungeon',     desc:'Level design, mechanic & gameplay engineering', color:'banner-gamedev',   bgDot:'#FFD93D' },
  fullstack: { icon:'🌐', title:'Full Stack Realm',     desc:'Web & mobile application — end to end', color:'banner-fullstack', bgDot:'#06B6D4' },
  cyber:     { icon:'🔐', title:'Cyber Security HQ',   desc:'Ethical hacking, tools & defensive security', color:'banner-cyber',     bgDot:'#FF4757' },
};

function filterProjects(cat, btn) {
  playClick();

  /* Update active button */
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  /* Update banner */
  const meta   = bannerMeta[cat];
  const banner = document.getElementById('cat-banner');
  const cards  = document.querySelectorAll('.arcade-card[data-category]');
  const total  = cat === 'all' ? cards.length : [...cards].filter(c => c.dataset.category === cat).length;

  banner.className = 'cat-banner ' + meta.color;
  document.getElementById('cat-banner-icon').textContent  = meta.icon;
  document.getElementById('cat-banner-title').textContent = meta.title;
  document.getElementById('cat-banner-desc').textContent  = meta.desc + ` — ${total} project`;

  // Animated dots colour
  document.querySelectorAll('.cat-banner-dots span').forEach(s => s.style.background = meta.bgDot);

  /* Filter cards with staggered animation */
  let visibleIdx = 0;
  cards.forEach(card => {
    const match = cat === 'all' || card.dataset.category === cat;
    if (!match) {
      card.classList.add('hidden');
    } else {
      card.classList.remove('hidden');
      card.style.transitionDelay = `${visibleIdx * 60}ms`;
      visibleIdx++;
    }
  });

  /* Rebuild grid so hidden cards don't leave gaps */
  rebuildGrid(cat);

  /* Empty state */
  document.getElementById('empty-state').style.display = visibleIdx === 0 ? 'block' : 'none';
}

function rebuildGrid(cat) {
  const grid  = document.getElementById('projects-grid');
  const cards = [...grid.querySelectorAll('.arcade-card[data-category]')];

  // Temporarily make hidden ones display:none after transition, show others
  cards.forEach(card => {
    if (card.classList.contains('hidden')) {
      card.style.position  = 'absolute';
      card.style.visibility = 'hidden';
      card.style.pointerEvents = 'none';
    } else {
      card.style.position  = '';
      card.style.visibility = '';
      card.style.pointerEvents = '';
    }
  });
}


/* =========================================================
   HUD scroll hide/show
   ========================================================= */
let lastScroll = 0;
const hud = document.getElementById('hud');
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  hud.style.opacity = current > lastScroll && current > 100 ? '0.7' : '1';
  lastScroll = current;
}, { passive: true });

/* =========================================================
   Cursor stays visible
   ========================================================= */
document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
document.addEventListener('mouseenter', () => cursor.style.opacity = '1');

console.log(`
%c🎮 The Playable Resume
%cAlifian's Portfolio — Now Loaded!
%cTry clicking the power-ups 😉
`,
'font-size:20px;color:#FFD93D;font-family:monospace',
'font-size:14px;color:#6EE7B7;font-family:monospace',
'font-size:12px;color:#A855F7;font-family:monospace'
);