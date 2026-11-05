/**
 * ==========================================================================
 * ELLAIZA ETHEREAL PORTFOLIO - JAVASCRIPT MOTION & INTERACTION ENGINE
 * ==========================================================================
 * Features:
 * 1. Shooting Star Cursor Follower with Click Pulse
 * 2. Tiny Floating Stardust & Ambient Sparkles Canvas (Drifting dust + cursor sparks)
 * 3. Character Card Autonomous Hover Floating with Interactive Mouse Tilt Blend
 * 4. Multi-Plane Parallax Universe Scroll Controller
 * 5. Minimal Works Cards Interaction + Lightbox Modal with Luminang.com Link
 * 6. Quick Hex Color Swatch Copying with Toast Notification
 * 7. Staggered Scroll-Spy Navigation Highlighter
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Immediate intro reveal trigger for hero eyecrop (slide right) & full name (fade up)
  const eyecropBanner = document.querySelector('.eyecrop-banner[data-reveal-right]');
  const heroNameBar = document.querySelector('.hero-name-bar[data-name-reveal]');
  if (eyecropBanner) {
    setTimeout(() => {
      eyecropBanner.classList.add('revealed');
    }, 100);
  }
  if (heroNameBar) {
    setTimeout(() => {
      heroNameBar.classList.add('revealed');
    }, 150);
  }

  // Dedicated cursor sparkle audio: Plays ONLY while mouse is in motion, fades out immediately on stop
  const sparkleAudio = new Audio('assets/Music/sparklele.mp3');
  sparkleAudio.loop = true;
  sparkleAudio.volume = 0; // Starts silent
  const SPARKLE_TARGET_VOLUME = 0.02; // Barely audible, delicate whisper of stardust

  let isSparklePlaying = false;
  let sparkleStopTimer = null;
  let sparkleFadeInterval = null;

  function onCursorMoveSound() {
    // Clear any pending stop or fade out
    if (sparkleStopTimer) clearTimeout(sparkleStopTimer);
    if (sparkleFadeInterval) clearInterval(sparkleFadeInterval);

    if (!isSparklePlaying) {
      sparkleAudio.currentTime = Math.random() * 2; // Randomize offset for lively sparkles
      sparkleAudio.play().then(() => {
        isSparklePlaying = true;
        sparkleAudio.volume = SPARKLE_TARGET_VOLUME;
      }).catch(() => { });
    } else {
      sparkleAudio.volume = SPARKLE_TARGET_VOLUME;
    }

    // Immediately fade out and stop as soon as the cursor stops moving (120ms pause)
    sparkleStopTimer = setTimeout(() => {
      // Rapid 80ms fade out to zero
      const step = SPARKLE_TARGET_VOLUME / 5;
      sparkleFadeInterval = setInterval(() => {
        if (sparkleAudio.volume > step) {
          sparkleAudio.volume -= step;
        } else {
          sparkleAudio.volume = 0;
          sparkleAudio.pause();
          isSparklePlaying = false;
          clearInterval(sparkleFadeInterval);
        }
      }, 16);
    }, 120);
  }

  // ==========================================================================
  // 1. SHOOTING STAR CUSTOM CURSOR FOLLOWER
  // ==========================================================================
  const starCursor = document.getElementById('star-cursor');
  const cursorGlow = document.getElementById('cursor-glow');

  if (starCursor) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        starCursor.style.opacity = '1';
        if (cursorGlow) cursorGlow.style.opacity = '1';
        isVisible = true;
      }
    });

    window.addEventListener('mousedown', () => {
      starCursor.classList.add('clicking');
    });

    window.addEventListener('mouseup', () => {
      starCursor.classList.remove('clicking');
    });

    window.addEventListener('mouseleave', () => {
      starCursor.style.opacity = '0';
      if (cursorGlow) cursorGlow.style.opacity = '0';
      isVisible = false;
    });

    function renderStarCursor() {
      currentX += (mouseX - currentX) * 0.22;
      currentY += (mouseY - currentY) * 0.22;

      starCursor.style.left = `${currentX}px`;
      starCursor.style.top = `${currentY}px`;

      if (cursorGlow) {
        cursorGlow.style.left = `${currentX}px`;
        cursorGlow.style.top = `${currentY}px`;
      }

      requestAnimationFrame(renderStarCursor);
    }
    renderStarCursor();
  }

  // ==========================================================================
  // 2. STARDUST & SPARKS CANVAS ENGINE
  // ==========================================================================
  const canvas = document.getElementById('stardust-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const PARTICLE_COUNT = 85;

    class StardustParticle {
      constructor(isBurst = false, x = null, y = null) {
        this.reset(isBurst, x, y);
      }

      reset(isBurst = false, x = null, y = null) {
        this.x = x !== null ? x : Math.random() * width;
        this.y = y !== null ? y : Math.random() * height;
        this.radius = isBurst ? Math.random() * 2.2 + 1 : Math.random() * 1.6 + 0.4;
        this.vx = isBurst ? (Math.random() - 0.5) * 3 : (Math.random() - 0.5) * 0.4;
        this.vy = isBurst ? (Math.random() - 0.5) * 3 : -Math.random() * 0.55 - 0.15; // Ambient slow upward drift
        this.alpha = isBurst ? 1 : Math.random() * 0.65 + 0.25;
        this.fadeRate = isBurst ? Math.random() * 0.02 + 0.015 : 0;
        this.isBurst = isBurst;
        this.isStar = Math.random() > 0.72; // 28% sparkle as 4-point stars
        this.color = Math.random() > 0.45 ? 'rgba(216, 194, 255,' : 'rgba(255, 235, 175,';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.isBurst) {
          this.alpha -= this.fadeRate;
        } else {
          // Wrap around screen edges
          if (this.y < -10) this.y = height + 10;
          if (this.x < -10) this.x = width + 10;
          if (this.x > width + 10) this.x = -10;
        }
      }

      draw() {
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.fillStyle = `${this.color} ${this.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(186, 155, 255, 0.6)';

        if (this.isStar) {
          // Draw 4-point celestial sparkle
          ctx.translate(this.x, this.y);
          ctx.beginPath();
          const s = this.radius * 2.5;
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
        } else {
          // Soft circular dust orb
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Populate initial stardust
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new StardustParticle());
    }

    // Interactive cursor sparkles & quiet SFX on mousemove
    let lastSparkleTime = 0;
    let lastSfxTime = 0;
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastSparkleTime > 30) { // Throttled burst for 60fps performance
        for (let i = 0; i < 2; i++) {
          particles.push(new StardustParticle(true, e.clientX, e.clientY));
        }
        lastSparkleTime = now;
      }

      // Play delicate sparkle SFX strictly while moving, immediately fading out when cursor pauses
      onCursorMoveSound();
    });

    // Particle Animation Loop
    function renderStardust() {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();

        if (p.isBurst && p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      requestAnimationFrame(renderStardust);
    }
    renderStardust();
  }

  // ==========================================================================
  // 3. GENERATE TWINKLING DEEP STARS
  // ==========================================================================
  const starsContainer = document.getElementById('stars-container');
  if (starsContainer) {
    const STAR_COUNT = 90;
    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement('div');
      star.className = 'star-dot';
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 2.2 + 0.8;
      const duration = (Math.random() * 3 + 2).toFixed(1);
      const delay = (Math.random() * 4).toFixed(1);

      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.setProperty('--twinkle-dur', `${duration}s`);
      star.style.setProperty('--twinkle-del', `${delay}s`);

      starsContainer.appendChild(star);
    }
  }

  // ==========================================================================
  // 4. CHARACTER CARD 3D PERSPECTIVE TILT (BLENDED WITH AUTONOMOUS FLOAT)
  // ==========================================================================
  const liveCard = document.getElementById('live2d-card');
  const liveImg = document.getElementById('live2d-img');
  const stage = document.querySelector('.live2d-stage-wrapper');

  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // Tilt disabled — floating only (no 3D mouse tilt on music player card)
  // Card uses CSS auto-hover-float animation only.

  // ==========================================================================
  // 5. PARALLAX SCROLL CONTROLLER
  // ==========================================================================
  const parallaxLayers = document.querySelectorAll('.p-layer');
  let isTicking = false;

  function updateParallax() {
    const scrollY = window.scrollY;

    // Background universe layers
    parallaxLayers.forEach((layer) => {
      const speed = parseFloat(layer.getAttribute('data-speed')) || 0.1;
      const yOffset = -(scrollY * speed);
      layer.style.transform = `translate3d(0, ${yOffset}px, 0)`;
    });

    // Header background blur on scroll
    const header = document.querySelector('.site-header');
    if (header) {
      if (scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    isTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateParallax);
      isTicking = true;
    }
  });

  // ==========================================================================
  // 6. POP-UP & SCROLL REVEAL OBSERVER (RE-TRIGGER ON EVERY SCROLL)
  // ==========================================================================
  const revealElements = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        } else {
          // Re-arm animation so elements fade/pop in every time user scrolls past them
          entry.target.classList.remove('revealed');
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ==========================================================================
  // 7. ACTIVE NAVIGATION SCROLL-SPY
  // ==========================================================================
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-item');

  function updateActiveNav() {
    let currentId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    if (!currentId && window.scrollY < 300) {
      currentId = 'home';
    }

    navItems.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('data-nav') === currentId) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ==========================================================================
  // 8. WORKS FILTERING
  // ==========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      galleryCards.forEach((card) => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => card.classList.add('hidden'), 250);
        }
      });
    });
  });

  // ==========================================================================
  // 9. INTERACTIVE ARTIFACT LIGHTBOX MODAL WITH EXTERNAL LINKS
  // ==========================================================================
  const artifactDatabase = {
    '1': {
      title: 'Starry-Eyed',
      category: 'ILLUSTRATION & CHARACTER ART',
      image: 'assets/images/Illustrations/Untitled_Artwork (5).png',
      desc: 'A hand-drawn digital illustration of a cosmic black cat gazing in wonder at a glowing halo of celestial starlight floating amidst vibrant nebulae and constellations.',
      specs: [
        'Original digital painting & texture brushwork',
        'Vibrant cosmic nebula palette with golden starlight focal point',
        'Character concept art & whimsical atmosphere',
        'Available in full high-resolution'
      ],
      colors: ['#0A0618', '#1F1240', '#E5A93C', '#4F68C4'],
      externalLinks: [
        { label: 'View Full High-Res Image ↗', url: 'assets/images/Illustrations/Untitled_Artwork (5).png' }
      ]
    },
    '2': {
      title: 'Starlight Maiden & Nyx',
      category: 'ILLUSTRATION & CHARACTER ART',
      image: 'assets/images/Illustrations/PurpleGirl.png',
      desc: 'A signature character portrait study exploring purple night tones, soft lighting, and companion black cat Nyx with gentle ambient breathing motion.',
      specs: [
        'High-resolution digital illustration',
        'Subtle breathing motion integration',
        'Palette: Obsidian Black, Midnight Violet & Lavender'
      ],
      colors: ['#05030A', '#2D165C', '#9B6CFA', '#D4B8FF']
    },
    '3': {
      title: 'Luminang: Language Learning Mobile Game',
      category: 'CAPSTONE PROJECT • 2025 – 2026',
      image: 'assets/images/luminang-website-hero.png',
      desc: 'National University – Dasmariñas Capstone Project. Co-developed an educational mobile game designed to teach Filipino and English vocabulary through interactive 3D quests, stylized island environments, and gamified quiz minigames on Android. Served as primary 3D artist and co-developer.',
      specs: [
        'Lead 3D Art & Asset Pipeline: Modeling & texturing low-poly environments, characters, & props in Blender and Unity for mobile',
        'Interactive Feature Co-Development: Co-developed Unity minigames, interactive objects, touch controls, and scene transitions',
        'UI/UX Implementation: Responsive menus, tactile feedback animations, and adaptive Android layouts',
        'Data Integration & Content Structuring: Structured JSON datasets for vocabulary, dialogue, and quiz mechanics',
        'Application QA & Testing: Manual testing on Android devices to detect glitches, UI misalignment, & performance bugs',
        'Team Collaboration & Alignment: Active coordination and agile milestone execution with groupmates'
      ],
      colors: ['#120D22', '#342157', '#6A43B8', '#9BE2C9'],
      externalLinks: [
        { label: 'Visit Luminang.com ↗', url: 'https://luminang.com' },
        { label: 'GitHub Repository ↗', url: 'https://github.com/ellaiza9017/Luminang' }
      ]
    },
    '4': {
      title: 'Official Resume • Ellaiza Rose B. Pesons',
      category: 'RESUME & CREDENTIALS',
      image: 'assets/images/ELLAIZA-RESUME.png',
      desc: 'Full 4th-year BSIT curriculum vitae detailing education at National University – Dasmariñas, capstone responsibilities on Luminang, and technical skills in programming, web/mobile, and database management.',
      specs: [
        'BSIT 4th-Year Student (2023 - Current)',
        'Capstone: Multimedia Asset Designer & Co-Developer (Luminang)',
        'Certifications: Java, Database, HTML and CSS',
        'Ready for OJT Internship & Freelance Commissions'
      ],
      colors: ['#FFFFFF', '#502D80', '#181329', '#E8DEFF'],
      externalLinks: [
        { label: 'Download Resume (PDF) ↗', url: 'assets/pdf/Ellaiza-Resume.pdf' },
        { label: 'View Full PNG ↗', url: 'assets/images/ELLAIZA-RESUME.png' }
      ]
    },
    '5': {
      title: 'Astral Inventory & RPG Icons',
      category: 'GAME UI & PROPS',
      image: 'assets/images/ui_game_assets_1792423789879.jpg',
      desc: 'A crafted kit of fantasy RPG UI elements: potion bottles, spellbooks, runes, and inventory item slot borders customized for Unity Canvas layouts.',
      specs: [
        'High-resolution UI icons & props',
        'Clean transparent alpha PNG exports',
        'Compatible with standard 9-slice sprite borders in Unity',
        'Structured in JSON data tables'
      ],
      colors: ['#080410', '#4A258A', '#8E63DB', '#F8D882']
    },
    '6': {
      title: 'ELLAIZA • Galaxy Logo & Vinyl',
      category: 'PERSONAL BRAND & SOUNDTRACK',
      image: 'assets/images/ellaiza-logo.png',
      desc: 'A little fragment of starlight preserved in a spinning cosmic disc. In between late-night blender renders, coding marathons, and quiet study hours, this little crest spins like a vintage vinyl in a cozy pocket of the universe, playing soothing lofi melodies to keep you company.',
      specs: [
        'Interactive Cosmic Vinyl: Click the header logo to toggle relaxing lo-fi background music',
        'Spins gracefully when audio is playing, pauses when muted',
        'Celestial orbit rings with starlight diamond flares and violet dust streak',
        'Handmade with love, cozy starlight, and late-night curiosity'
      ],
      colors: ['#000000', '#2E124D', '#AA77FF', '#FFFFFF']
    },
    'storyboard': {
      title: 'Luminang: 51-Page Master Mobile Game Storyboard',
      category: 'STORYBOARD &bull; NARRATIVE DESIGN',
      image: 'assets/images/lowpoly_isometric_game_1792423768836.jpg',
      desc: 'Comprehensive 51-page visual and gameplay script for the Luminang Language Learning Mobile Game. Spans level introductions, island geography maps, quest flowcharts, NPC dialogue trees, and vocabulary minigame wireframes.',
      specs: [
        '51 Detailed sequential scenes illustrating full narrative and gameplay flows',
        'Covers introductory cinematic, player tutorials, and island progression',
        'Outlines NPC dialogue branches and interactive trigger zones',
        'Visual layout references used directly for Blender modeling and Unity scene assembly'
      ],
      colors: ['#080414', '#28154D', '#7C3AED', '#FCE8A6'],
      externalLinks: [
        { label: 'Visit Luminang.com ↗', url: 'https://luminang.com' },
        { label: 'GitHub Repository ↗', url: 'https://github.com/ellaiza9017/Luminang' }
      ]
    }
  };

  const modal = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const closeOverlay = document.getElementById('lightbox-close-overlay');
  const inspectBtns = document.querySelectorAll('.btn-inspect-artifact');
  const actionsContainer = document.getElementById('lightbox-actions-container');

  function openModal(id) {
    const data = artifactDatabase[id];
    if (!data || !modal) return;

    document.getElementById('lightbox-img').src = data.image;
    document.getElementById('lightbox-title').innerHTML = data.title;
    document.getElementById('lightbox-category').textContent = data.category;
    document.getElementById('lightbox-desc').textContent = data.desc;

    // Swatches
    const swatchesContainer = document.getElementById('lightbox-swatches');
    if (swatchesContainer) {
      swatchesContainer.innerHTML = '';
      if (data.colors) {
        data.colors.forEach((col) => {
          const swatch = document.createElement('div');
          swatch.className = 'modal-swatch';
          swatch.style.background = col;
          swatch.title = col;
          swatchesContainer.appendChild(swatch);
        });
      }
    }

    // Dynamic actions (Luminang.com / GitHub Capstone, etc. without Copy Link)
    if (actionsContainer) {
      actionsContainer.innerHTML = '';

      if (data.externalLinks) {
        data.externalLinks.forEach((link) => {
          const a = document.createElement('a');
          a.href = link.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'btn-celestial primary';
          a.innerHTML = `<span class="btn-sparkle">✦</span><span>${link.label}</span>`;
          actionsContainer.appendChild(a);
        });
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  window.openModal = openModal;

  function closeModal() {
    if (!modal) return;
    const modalVideo = document.getElementById('lightbox-video');
    if (modalVideo) {
      modalVideo.pause();
    }
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  window.closeModal = closeModal;

  // ==========================================================================
  // BACKGROUND VINYL MUSIC CONTROLLER
  // ==========================================================================
  const bgAudio = document.getElementById('bg-audio');
  const vinylDisc = document.getElementById('vinyl-disc');
  const musicText = document.getElementById('music-text');
  const cardMusicToggle = document.getElementById('card-music-toggle');
  const cardPlayPath = document.getElementById('card-play-path');
  const cardSoundWave = document.getElementById('card-sound-wave');
  let isMusicPlaying = false;

  const PATH_PLAY = 'M8 5v14l11-7z';
  const PATH_PAUSE = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z';

  function updateMusicUI(playing) {
    isMusicPlaying = playing;
    if (vinylDisc) {
      if (playing) {
        vinylDisc.classList.remove('vinyl-paused');
        vinylDisc.classList.add('vinyl-spin');
      } else {
        vinylDisc.classList.remove('vinyl-spin');
        vinylDisc.classList.add('vinyl-paused');
      }
    }
    if (musicText) {
      musicText.textContent = playing ? 'Now Playing' : 'Vinyl Muted';
    }
    if (cardPlayPath) {
      cardPlayPath.setAttribute('d', playing ? PATH_PAUSE : PATH_PLAY);
    }
    if (cardSoundWave) {
      if (playing) {
        cardSoundWave.classList.remove('paused');
      } else {
        cardSoundWave.classList.add('paused');
      }
    }
  }

  const LOFI_PLAYLIST = [
    {
      name: 'Good Night • Cozy Lo-Fi',
      sub: 'Chill Study & Coding Vibes • FASSounds',
      src: 'assets/Music/fassounds-good-night-lofi-cozy-chill-music-160166.mp3'
    },
    {
      name: 'Vinyl Teapot • Cozy Lo-Fi',
      sub: 'Chill Lo-Fi Acoustic • Ornave',
      src: 'assets/Music/ornave-lofi-vinyl-teapot-553356.mp3'
    },
    {
      name: 'Chill Lo-Fi Beat',
      sub: 'Mellow Atmosphere • Velario Music',
      src: 'assets/Music/velariomusic-chill-lofi-616929.mp3'
    },
    {
      name: 'Midnight Breeze',
      sub: 'Peaceful Focus Vibes • Zephira Music',
      src: 'assets/Music/zephiramusic-chill-lofi-585360.mp3'
    }
  ];

  let currentTrackIdx = 0;
  const playerPrevBtn = document.getElementById('player-prev-btn');
  const playerNextBtn = document.getElementById('player-next-btn');
  const cardPlayBtn = document.getElementById('card-play-btn');
  const playerTrackName = document.getElementById('player-track-name');
  const playerTrackSub = document.getElementById('player-track-sub');

  function loadTrack(idx, autoPlay = true) {
    currentTrackIdx = (idx + LOFI_PLAYLIST.length) % LOFI_PLAYLIST.length;
    const track = LOFI_PLAYLIST[currentTrackIdx];

    if (playerTrackName) playerTrackName.textContent = track.name;
    if (playerTrackSub) playerTrackSub.textContent = track.sub;

    bgAudio.src = track.src;
    bgAudio.load();

    if (autoPlay) {
      bgAudio.play().then(() => {
        updateMusicUI(true);
      }).catch(() => {
        updateMusicUI(false);
      });
    }
  }

  // Header Logo: Vinyl player toggle & modal viewer
  const logoBtn = document.getElementById('btn-view-logo');
  if (bgAudio) {
    bgAudio.volume = 0.32; // Comfortable, cozy lo-fi volume

    function startMusic() {
      if (!isMusicPlaying) {
        bgAudio.play().then(() => {
          updateMusicUI(true);
        }).catch(() => { });
      }
    }

    function toggleMusic() {
      if (isMusicPlaying) {
        bgAudio.pause();
        updateMusicUI(false);
      } else {
        startMusic();
      }
    }

    // Preload track 0 metadata
    loadTrack(0, false);

    // Try playing immediately
    startMusic();

    // Browsers only allow audio after a real user gesture (click / key / tap).
    // mousemove and scroll do NOT count, so we listen for gestures that do.
    const GESTURES = ['pointerup', 'mouseup', 'click', 'keydown', 'touchend'];
    const removeGestureListeners = () => {
      GESTURES.forEach((evt) => window.removeEventListener(evt, autoPlayOnActivity, true));
    };
    function autoPlayOnActivity() {
      if (isMusicPlaying) { removeGestureListeners(); return; }
      bgAudio.play().then(() => {
        updateMusicUI(true);
        removeGestureListeners();
      }).catch(() => { /* not allowed yet; wait for the next gesture */ });
    }
    GESTURES.forEach((evt) => {
      window.addEventListener(evt, autoPlayOnActivity, { capture: true, passive: true });
    });

    // Retry autoplay at every moment the browser might allow it
    window.addEventListener('load', startMusic);
    window.addEventListener('pageshow', startMusic);
    bgAudio.addEventListener('canplay', startMusic, { once: true });

    if (logoBtn) {
      logoBtn.addEventListener('click', toggleMusic);
      // Right click on logo allows inspecting the full art
      logoBtn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openModal('6');
      });
    }

    if (cardPlayBtn) {
      cardPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusic();
      });
    }

    if (playerPrevBtn) {
      playerPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        loadTrack(currentTrackIdx - 1, true);
      });
    }

    if (playerNextBtn) {
      playerNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        loadTrack(currentTrackIdx + 1, true);
      });
    }

    // Automatically transition to next song when current track finishes
    bgAudio.addEventListener('ended', () => {
      loadTrack(currentTrackIdx + 1, true);
    });
  }

  inspectBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-artifact');
      openModal(id);
    });
  });

  // Minimal cards click directly to open lightbox
  galleryCards.forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-artifact');
      if (id) {
        openModal(id);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeOverlay) closeOverlay.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ==========================================================================
  // 10. COLOR SWATCH QUICK-COPY
  // ==========================================================================
  const swatches = document.querySelectorAll('.swatch');
  swatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const hex = swatch.getAttribute('data-hex');
      navigator.clipboard.writeText(hex);

      // Create quick floating toast near swatch
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: #9b6cfa;
        color: #fff;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 0.68rem;
        font-family: var(--font-mono);
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        z-index: 10;
        pointer-events: none;
      `;
      toast.textContent = `Copied ${hex}!`;
      swatch.appendChild(toast);

      setTimeout(() => toast.remove(), 1500);
    });
  });

  // ==========================================================================
  // 11. CONTACT FORM HANDLER
  // ==========================================================================
  const WEB3FORMS_ACCESS_KEY = '60d71fb8-9841-4fd3-8f01-5269099cf2c1';

  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (form && formStatus) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const defaultBtnHTML = submitBtn.innerHTML;
    const subjectLabels = {
      ojt: 'OJT / Internship Opportunity',
      freelance: '3D / Multimedia Freelance Commission',
      other: 'General Inquiry'
    };

    const showStatus = (message, type) => {
      formStatus.textContent = message;
      formStatus.className = `form-notification ${type}`;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot: bots fill hidden fields, humans don't.
      if (form.querySelector('[name="botcheck"]')?.checked) return;

      const data = new FormData(form);
      const name = data.get('name');
      const subjectKey = data.get('subject');

      data.append('access_key', WEB3FORMS_ACCESS_KEY);
      data.set('subject', `Portfolio: ${subjectLabels[subjectKey] || 'New Message'} — from ${name}`);
      data.append('from_name', 'Ellaiza Portfolio');
      data.set('inquiry_type', subjectLabels[subjectKey] || subjectKey);
      data.append('replyto', data.get('email'));

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending Message...</span>';
      formStatus.className = 'form-notification';

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data
        });
        const result = await res.json();

        if (res.ok && result.success) {
          showStatus('Thank you! Your message has been sent to Ellaiza. I will get back to you shortly.', 'success');
          form.reset(); // only clear on confirmed delivery
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        console.error('Contact form error:', err);
        showStatus('Sorry, your message could not be sent. Please try again or email pesonsellaiza@gmail.com directly.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = defaultBtnHTML;
      }
    });
  }

  // ==========================================================================
  // 12. MOBILE HAMBURGER MENU DRAWER
  // ==========================================================================
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

  if (mobileMenuToggle && mobileNavDrawer) {
    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenuToggle.classList.toggle('active');
      mobileNavDrawer.classList.toggle('active');
    });

    // Close mobile drawer when clicking any link
    mobileNavDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        mobileNavDrawer.classList.remove('active');
      });
    });

    // Close when tapping outside
    document.addEventListener('click', (e) => {
      if (!mobileNavDrawer.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        mobileMenuToggle.classList.remove('active');
        mobileNavDrawer.classList.remove('active');
      }
    });
  }


  // ==========================================================================
  // 13. SCROLL DOWN INDICATOR HIDE ON SCROLL
  // ==========================================================================
  const scrollIndicator = document.getElementById('scroll-indicator');
  window.addEventListener('scroll', () => {
    if (scrollIndicator) {
      if (window.scrollY > 20) {
        scrollIndicator.classList.add('hidden');
      } else {
        scrollIndicator.classList.remove('hidden');
      }
    }
  }, { passive: true });

  // ==========================================================================
  // 14. TYPING ANIMATION (AI driven workflow | Hand drawn illustrations | Inspired creative designs)
  // ==========================================================================
  const typingEl = document.getElementById('typing-text');
  if (typingEl) {
    const phrases = [
      'AI driven workflow',
      'Hand drawn illustrations',
      'Inspired creative designs'
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function typeNext() {
      const current = phrases[phraseIdx];
      if (isDeleting) {
        charIdx--;
        typingEl.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(typeNext, 450);
          return;
        }
        setTimeout(typeNext, 35);
      } else {
        charIdx++;
        typingEl.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          isDeleting = true;
          setTimeout(typeNext, 2000);
          return;
        }
        setTimeout(typeNext, 65);
      }
    }
    typeNext();
  }

  // ==========================================================================
  // 15. SIDE REVEAL OBSERVER (SLIDE FROM SIDES FOR ABOUT SECTION)
  // ==========================================================================
  const revealSideElements = document.querySelectorAll('[data-reveal-left], [data-reveal-right], [data-name-reveal]');
  const sideRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        } else {
          entry.target.classList.remove('revealed');
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
  );
  revealSideElements.forEach((el) => sideRevealObserver.observe(el));

  // ==========================================================================
  // 16. SKILL BOX OPEN ANIMATION (SPLIT OPEN FROM CENTER LINE)
  // ==========================================================================
  const skillBoxes = document.querySelectorAll('[data-box-open]');
  const skillBoxObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = Array.from(skillBoxes).indexOf(entry.target) * 160;
        setTimeout(() => {
          entry.target.classList.add('box-opened');
        }, delay);
      } else {
        entry.target.classList.remove('box-opened');
      }
    });
  }, { threshold: 0.15 });
  skillBoxes.forEach((box) => skillBoxObserver.observe(box));

  // ==========================================================================
  // 17. SKILL EXPLANATION POPUP PANEL
  // ==========================================================================
  const skillDescriptions = {
    'java-cs': { title: 'Java • C#', desc: 'Foundational object-oriented programming in Java and C# game scripting in Unity for Luminang capstone mechanics and interactive elements.' },
    'react-flutter': { title: 'React • Flutter', desc: 'Frontend web component development with React and cross-platform mobile application development with Flutter.' },
    'html-css': { title: 'HTML5 & CSS3', desc: 'Modern responsive web layouts, custom animations, celestial design systems, and semantic markup.' },
    'unity': { title: 'Unity Engine', desc: 'Scene construction, mobile touch controls, minigame mechanics, audio integration, and Android exports in Luminang.' },
    'git': { title: 'Git / GitHub', desc: 'Version control, repository management, and collaboration workflows (@ellaiza9017).' },
    'mysql-oracle': { title: 'MySQL • Oracle', desc: 'Relational database schema modeling, SQL querying, constraints, and academic database management systems.' },
    'supabase-firebase': { title: 'Supabase • Firebase', desc: 'Cloud backend services, user authentication, realtime database listeners, and storage integration.' },
    'schema': { title: 'Database Schema Design', desc: 'Entity-relationship diagrams (ERD), normalization (1NF-3NF), and database architecture structuring.' },
    'json-api': { title: 'JSON & REST APIs', desc: 'Data structuring, JSON vocabulary formatting for games, and RESTful API consumption.' },
    'qa': { title: 'QA Testing', desc: 'Manual QA system verification and testing across Android devices to catch UI overflow, scene transition glitches, and ensure responsive behavior.' },
    'blender': { title: 'Blender 3D', desc: 'Low-poly 3D modeling, UV unwrapping, prop creation, texturing, and asset optimization for mobile game engines.' },
    'procreate-krita': { title: 'Procreate • Krita', desc: 'Hand-drawn digital illustrations, character concept design, line art, and custom artwork creations.' },
    'canva-capcut': { title: 'Canva • CapCut • Pinterest', desc: 'Graphic design layouts, branding assets, presentation mockups, creative moodboarding in Pinterest, and video reel editing with timing and effects.' },
    'uiux': { title: 'UI/UX Layouts', desc: 'User flow mapping, mobile wireframes, intuitive layout prototyping, and accessible component hierarchies.' },
    'ai-tooling': { title: 'AI Tooling (Claude, ChatGPT, Antigravity IDE)', desc: 'Utilizing Claude, ChatGPT, GitHub Copilot, and Antigravity IDE to streamline coding workflows, debugging, and ideation.' }
  };

  const skillPopup = document.getElementById('skill-popup');
  const skillPopupTitle = document.getElementById('skill-popup-title');
  const skillPopupDesc = document.getElementById('skill-popup-desc');
  const skillPopupClose = document.getElementById('skill-popup-close');

  document.querySelectorAll('.skill-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-skill-id');
      const data = skillDescriptions[id];
      if (data && skillPopup) {
        skillPopupTitle.textContent = data.title;
        skillPopupDesc.textContent = data.desc;
        skillPopup.classList.add('active');
        skillPopup.setAttribute('aria-hidden', 'false');
      }
    });
  });

  if (skillPopupClose) {
    skillPopupClose.addEventListener('click', () => {
      skillPopup.classList.remove('active');
      skillPopup.setAttribute('aria-hidden', 'true');
    });
  }
  if (skillPopup) {
    skillPopup.addEventListener('click', (e) => {
      if (e.target === skillPopup) {
        skillPopup.classList.remove('active');
        skillPopup.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // ==========================================================================
  // 18. WORKS CARDS REVEAL (TRIGGERED AFTER SELECTED WORKS TITLE IS VISIBLE)
  // ==========================================================================
  const archGallery = document.querySelector('.arch-gallery, .arch-gallery-5');
  const worksTitleBlock = document.querySelector('.works-title-block');
  if (archGallery) {
    archGallery.classList.add('works-hidden');
  }
  if (worksTitleBlock && archGallery) {
    const worksObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              archGallery.classList.remove('works-hidden');
              archGallery.classList.add('works-revealed');
              archGallery.querySelectorAll('.arch-card').forEach((card, i) => {
                card.style.transitionDelay = (i * 0.15) + 's';
              });
            }, 550);
          }
        });
      },
      { threshold: 0.3 }
    );
    worksObserver.observe(worksTitleBlock);
  }

  // ==========================================================================
  // 19. GRADIENT TITLE CURSOR SPOTLIGHT (DARK INVERT ON TOUCHED SPOT)
  // ==========================================================================
  const isFinePointerDevice = window.matchMedia('(pointer: fine)').matches;
  if (isFinePointerDevice) {
    document.querySelectorAll('.gradient-title, .section-title').forEach((titleEl) => {
      const spotlight = document.createElement('span');
      spotlight.className = 'title-spotlight';
      spotlight.textContent = titleEl.textContent;
      spotlight.setAttribute('aria-hidden', 'true');
      titleEl.appendChild(spotlight);

      titleEl.addEventListener('mousemove', (e) => {
        const rect = titleEl.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        spotlight.style.setProperty('--mx', mx + 'px');
        spotlight.style.setProperty('--my', my + 'px');
      });

      titleEl.addEventListener('mouseleave', () => {
        spotlight.style.setProperty('--mx', '-500px');
        spotlight.style.setProperty('--my', '-500px');
      });
    });
  }

  // ==========================================================================
  // 20. SECTION NAVIGATION INDICATOR (LEFT FIXED DOTS & SPARKLES)
  // ==========================================================================
  const navIndicator = document.querySelector('.section-nav-indicator');
  if (navIndicator) {
    const indDots = navIndicator.querySelectorAll('.nav-ind-dot');
    const sectionIds = ['home', 'about', 'skills', 'works', 'contact'];

    function updateIndDots() {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      let activeIdx = 0;
      sectionIds.forEach((id, i) => {
        const sec = document.getElementById(id);
        if (sec && scrollPos >= sec.offsetTop) {
          activeIdx = i;
        }
      });
      indDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIdx);
      });
    }

    window.addEventListener('scroll', updateIndDots, { passive: true });
    updateIndDots();

    indDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        const target = document.getElementById(sectionIds[i]);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }


  // ==========================================================================
  // WORKS SECTION: ARCH SVG FRAMES & COMING SOON UX
  // ==========================================================================

  // 1. Coming Soon Notification Toast
  const comingSoonToast = document.getElementById('coming-soon-toast');
  let toastTimer = null;

  function showComingSoonToast() {
    if (!comingSoonToast) return;
    if (toastTimer) clearTimeout(toastTimer);
    comingSoonToast.classList.add('active');
    toastTimer = setTimeout(() => {
      comingSoonToast.classList.remove('active');
    }, 3200);
  }

  // Bind to all elements with data-coming-soon (nav link, explore buttons)
  const comingSoonTriggers = document.querySelectorAll('[data-coming-soon]');
  comingSoonTriggers.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showComingSoonToast();
    });
  });

  // 2. SVG Frame Lightbox & Video Lightbox Modals
  const svgLbModal = document.getElementById('svgframe-lb-modal');
  const svgLbImg = document.getElementById('svgframe-lb-img');
  const svgLbActions = document.getElementById('svgframe-lb-actions');
  const svgLbClose = document.getElementById('svgframe-lb-close');
  const svgLbBackdrop = document.getElementById('svgframe-lb-backdrop');

  const videoLbModal = document.getElementById('video-lightbox-modal');
  const videoLbPlayer = document.getElementById('modal-video');
  const videoLbClose = document.getElementById('video-lb-close-btn');
  const videoLbBackdrop = document.getElementById('video-lb-close-overlay');

  function openSvgLb(imgSrc, altText, isLuminang = false) {
    if (!svgLbModal || !svgLbImg) return;
    svgLbImg.src = imgSrc;
    svgLbImg.alt = altText || '';

    if (svgLbActions) {
      svgLbActions.innerHTML = '';
      if (isLuminang) {
        const link = document.createElement('a');
        link.href = 'https://luminang.com';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'luminang-gradient-link';
        link.innerHTML = `
          <span>visit luminang.com</span>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        `;
        svgLbActions.appendChild(link);
      }
    }

    svgLbModal.classList.add('active');
    svgLbModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeSvgLb() {
    if (!svgLbModal) return;
    svgLbModal.classList.remove('active');
    svgLbModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openVideoLb() {
    if (!videoLbModal) return;
    videoLbModal.classList.add('active');
    videoLbModal.setAttribute('aria-hidden', 'false');
    if (videoLbPlayer) {
      videoLbPlayer.currentTime = 0;
      videoLbPlayer.play();
    }
    document.body.style.overflow = 'hidden';
  }

  function closeVideoLb() {
    if (!videoLbModal) return;
    if (videoLbPlayer) {
      videoLbPlayer.pause();
    }
    videoLbModal.classList.remove('active');
    videoLbModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (svgLbClose) svgLbClose.addEventListener('click', closeSvgLb);
  if (svgLbBackdrop) svgLbBackdrop.addEventListener('click', closeSvgLb);
  if (videoLbClose) videoLbClose.addEventListener('click', closeVideoLb);
  if (videoLbBackdrop) videoLbBackdrop.addEventListener('click', closeVideoLb);

  // Keyboard escape closes active modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSvgLb();
      closeVideoLb();
    }
  });

  // 3. Bind click handlers to the 5 Arch Frame Cards
  const frameCards = document.querySelectorAll('[data-works-card]');
  frameCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // If clicking inside a link inside the card, let default happen
      if (e.target.closest('a')) return;

      const frameType = card.getAttribute('data-frame');
      switch (frameType) {
        case 'cat':
          openSvgLb('assets/images/Works/celestial_cat.png', 'Celestial Cat Illustration');
          break;
        case 'luminang':
          openSvgLb('assets/images/Works/luminang_full.png', 'Luminang: Language Learning Mobile Game', true);
          break;
        case 'video':
          openVideoLb();
          break;
        case 'fullbody':
          openSvgLb('assets/images/ellaiza-logo.png', 'Personal Logo (AI Modified Design)');
          break;
        case 'purplegirl':
          openSvgLb('assets/images/Works/purple_girl_full.png', 'Character Close-up Illustration');
          break;
        default:
          break;
      }
    });
  });

  // ==========================================================================
  // WORKS FRAMES: holographic gradient on SVG border lines (same palette as Skills)
  // Inlines each frame SVG, then paints its line/star shapes with an animated gradient.
  // Falls back silently to the plain <img> if the SVG can't be fetched.
  // ==========================================================================
  (function initWorksFrameGradients() {
    const NS = 'http://www.w3.org/2000/svg';
    const STOPS = [
      ['0%', '#3D2968'], ['20%', '#8E63DB'], ['38%', '#D4B8FF'], ['50%', '#FFFFFF'],
      ['62%', '#D4B8FF'], ['80%', '#8E63DB'], ['100%', '#3D2968']
    ];
    const SKIP = new Set(['image', 'defs', 'clippath', 'mask', 'pattern', 'lineargradient',
      'radialgradient', 'filter', 'style', 'title', 'desc', 'metadata', 'foreignobject']);
    let uid = 0;

    function makeGradient(defs, bb, delay) {
      const vertical = bb.height > bb.width;
      const len = Math.max(vertical ? bb.height : bb.width, 1);
      const g = document.createElementNS(NS, 'linearGradient');
      const id = 'wfg' + (uid++);
      g.setAttribute('id', id);
      g.setAttribute('gradientUnits', 'userSpaceOnUse');
      g.setAttribute('spreadMethod', 'reflect');
      g.setAttribute('x1', bb.x);
      g.setAttribute('y1', bb.y);
      g.setAttribute('x2', vertical ? bb.x : bb.x + len);
      g.setAttribute('y2', vertical ? bb.y + len : bb.y);
      STOPS.forEach(([o, c]) => {
        const s = document.createElementNS(NS, 'stop');
        s.setAttribute('offset', o);
        s.setAttribute('stop-color', c);
        g.appendChild(s);
      });
      const anim = document.createElementNS(NS, 'animateTransform');
      anim.setAttribute('attributeName', 'gradientTransform');
      anim.setAttribute('type', 'translate');
      anim.setAttribute('from', '0 0');
      anim.setAttribute('to', vertical ? '0 ' + (len * 2) : (len * 2) + ' 0');
      anim.setAttribute('dur', '4.5s');
      anim.setAttribute('begin', delay + 's');
      anim.setAttribute('repeatCount', 'indefinite');
      g.appendChild(anim);
      defs.appendChild(g);
      return 'url(#' + id + ')';
    }


    // Measure the real arch shape from the SVG's own clip paths so the hover overlay
    // matches each frame exactly (position, size AND the arch curve).
    function measureArch(live, card, idx) {
      const vb = live.viewBox && live.viewBox.baseVal;
      const rootCTM = live.getScreenCTM();
      if (!vb || !vb.width || !rootCTM) return;
      const inv = rootCTM.inverse();
      let best = null;
      live.querySelectorAll('[clip-path]').forEach((g) => {
        const m = (g.getAttribute('clip-path') || '').match(/url\(#([^)]+)\)/);
        if (!m) return;
        const cp = live.querySelector('[id="' + m[1] + '"]');
        if (!cp) return;
        cp.querySelectorAll('path').forEach((p) => {
          const d = p.getAttribute('d') || '';
          if (!/C/.test(d) || /[A-BD-KN-YZa-df-z]/.test(d.replace(/[MLCZ]/g, ''))) return;
          const nums = (d.match(/-?\d*\.?\d+/g) || []).map(Number);
          let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
          for (let k = 0; k + 1 < nums.length; k += 2) {
            x0 = Math.min(x0, nums[k]); x1 = Math.max(x1, nums[k]);
            y0 = Math.min(y0, nums[k + 1]); y1 = Math.max(y1, nums[k + 1]);
          }
          const gc = g.getScreenCTM();
          if (!gc) return;
          const rel = inv.multiply(gc);
          const X = (x, y) => rel.a * x + rel.c * y + rel.e;
          const Y = (x, y) => rel.b * x + rel.d * y + rel.f;
          const rx0 = Math.min(X(x0, y0), X(x1, y1)), rx1 = Math.max(X(x0, y0), X(x1, y1));
          const ry0 = Math.min(Y(x0, y0), Y(x1, y1)), ry1 = Math.max(Y(x0, y0), Y(x1, y1));
          const w = rx1 - rx0, h = ry1 - ry0, aspect = w / h;
          if (aspect < 0.2 || aspect > 0.85 || w * h < vb.width * vb.height * 0.04) return;
          if (!best || w * h > best.area) {
            best = { area: w * h, rx0, ry0, w, h, d, px: x0, py: y0, pw: x1 - x0, ph: y1 - y0 };
          }
        });
      });
      if (!best) return;
      const pct = (v, o, s) => (((v - o) / s) * 100).toFixed(3) + '%';
      if (card.getAttribute('data-frame') === 'fullbody') {
        // The raw LogoFrame.svg is an A4-sized canvas with the arch in the middle.
        // Crop the viewBox to the arch so the frame renders at full size and sits where the layout expects.
        const pad = 1.2;
        const vx = best.rx0 - pad, vy = best.ry0 - pad, vw = best.w + pad * 2, vh = best.h + pad * 2;
        live.setAttribute('viewBox', [vx, vy, vw, vh].join(' '));
        card.style.setProperty('--ax', ((pad / vw) * 100).toFixed(3) + '%');
        card.style.setProperty('--ay', ((pad / vh) * 100).toFixed(3) + '%');
        card.style.setProperty('--aw', ((best.w / vw) * 100).toFixed(3) + '%');
        card.style.setProperty('--ah', ((best.h / vh) * 100).toFixed(3) + '%');
      } else {
        card.style.setProperty('--ax', pct(best.rx0, vb.x, vb.width));
        card.style.setProperty('--ay', pct(best.ry0, vb.y, vb.height));
        card.style.setProperty('--aw', ((best.w / vb.width) * 100).toFixed(3) + '%');
        card.style.setProperty('--ah', ((best.h / vb.height) * 100).toFixed(3) + '%');
      }

      let defs = live.querySelector('defs');
      if (!defs) { defs = document.createElementNS(NS, 'defs'); live.insertBefore(defs, live.firstChild); }
      const clip = document.createElementNS(NS, 'clipPath');
      const cid = 'works-arch-clip-' + idx;
      clip.setAttribute('id', cid);
      clip.setAttribute('clipPathUnits', 'objectBoundingBox');
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', best.d);
      path.setAttribute('transform', 'matrix(' + (1 / best.pw) + ',0,0,' + (1 / best.ph) + ',' + (-best.px / best.pw) + ',' + (-best.py / best.ph) + ')');
      clip.appendChild(path);
      defs.appendChild(clip);
      card.style.setProperty('--arch-clip', 'url(#' + cid + ')');
      card.classList.add('works-clip-ready');
    }


    // For big fills that are clipped to a small shape (e.g. a star cut from a huge rect),
    // return the clip region's bbox in the element's own coordinates so the gradient fits it.
    function clippedBBox(el, svg) {
      const ec = el.getScreenCTM();
      if (!ec) return null;
      const elInv = ec.inverse();
      let best = null;
      for (let g = el.parentNode; g && g !== svg; g = g.parentNode) {
        const m = ((g.getAttribute && g.getAttribute('clip-path')) || '').match(/url\(#([^)]+)\)/);
        if (!m) continue;
        const cp = svg.querySelector('[id="' + m[1] + '"]');
        const gc = g.getScreenCTM && g.getScreenCTM();
        if (!cp || !gc) continue;
        const rel = elInv.multiply(gc);
        cp.querySelectorAll('path').forEach((p) => {
          const nums = ((p.getAttribute('d') || '').match(/-?\d*\.?\d+/g) || []).map(Number);
          let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
          for (let k = 0; k + 1 < nums.length; k += 2) {
            x0 = Math.min(x0, nums[k]); x1 = Math.max(x1, nums[k]);
            y0 = Math.min(y0, nums[k + 1]); y1 = Math.max(y1, nums[k + 1]);
          }
          if (!isFinite(x0)) return;
          const ax = rel.a * x0 + rel.c * y0 + rel.e, ay = rel.b * x0 + rel.d * y0 + rel.f;
          const bx = rel.a * x1 + rel.c * y1 + rel.e, by = rel.b * x1 + rel.d * y1 + rel.f;
          const r = { x: Math.min(ax, bx), y: Math.min(ay, by), width: Math.abs(bx - ax), height: Math.abs(by - ay) };
          const area = r.width * r.height;
          if (area > 0 && (!best || area < best.area)) best = Object.assign(r, { area });
        });
      }
      return best;
    }

    function paint(svg, delay) {
      const vb = svg.viewBox && svg.viewBox.baseVal;
      const vbArea = vb && vb.width ? vb.width * vb.height : Infinity;
      let defs = svg.querySelector('defs');
      if (!defs) { defs = document.createElementNS(NS, 'defs'); svg.insertBefore(defs, svg.firstChild); }

      svg.querySelectorAll('path, line, polyline, polygon, circle, ellipse, rect').forEach((el) => {
        if (el.closest('defs, clipPath, mask, pattern')) return;
        if (SKIP.has(el.tagName.toLowerCase())) return;
        let cs, bb;
        try { cs = getComputedStyle(el); bb = el.getBBox(); } catch (e) { return; }
        const fill = cs.fill, stroke = cs.stroke;
        const hasStroke = stroke && stroke !== 'none' && !stroke.startsWith('url');
        const hasFill = fill && fill !== 'none' && !fill.startsWith('url');
        // Never recolour artwork: skip big filled shapes
        const big = bb.width * bb.height > vbArea * 0.25;
        if (hasStroke) {
          el.setAttribute('stroke', makeGradient(defs, bb, delay));
          el.style.stroke = el.getAttribute('stroke');
        }
        if (hasFill && !big) {
          el.setAttribute('fill', makeGradient(defs, bb, delay));
          el.style.fill = el.getAttribute('fill');
        } else if (hasFill && big) {
          const cb = clippedBBox(el, svg);
          if (cb && cb.area < bb.width * bb.height * 0.5) {
            el.setAttribute('fill', makeGradient(defs, cb, delay));
            el.style.fill = el.getAttribute('fill');
          }
        }
      });
    }

    document.querySelectorAll('.works-frame-col img.works-frame-svg').forEach((img, i) => {
      fetch(img.getAttribute('src'))
        .then((r) => { if (!r.ok) throw new Error('svg ' + r.status); return r.text(); })
        .then((txt) => {
          const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
          const src = doc.documentElement;
          if (!src || src.nodeName.toLowerCase() !== 'svg') throw new Error('bad svg');
          const svg = document.importNode(src, true);
          // make ids unique per frame so clipPaths/patterns don't collide
          const prefix = 'wf' + i + '_';
          let markup = new XMLSerializer().serializeToString(svg);
          markup = markup.replace(/id="([^"]+)"/g, 'id="' + prefix + '$1"')
            .replace(/url\(#([^)]+)\)/g, 'url(#' + prefix + '$1)')
            .replace(/(xlink:)?href="#([^"]+)"/g, (m, x, id) => (x || '') + 'href="#' + prefix + id + '"');
          const holder = document.createElement('div');
          holder.innerHTML = markup;
          const live = holder.firstElementChild;
          live.setAttribute('class', img.getAttribute('class') || 'works-frame-svg');
          live.setAttribute('aria-hidden', 'true');
          live.removeAttribute('width');
          live.removeAttribute('height');
          live.style.overflow = 'visible';
          img.insertAdjacentElement('afterend', live);
          img.style.display = 'none';
          paint(live, -i * 0.9);
          const owner = img.closest('[data-works-card]');
          if (owner && !img.classList.contains('works-lines') && owner.getAttribute('data-frame') !== 'video') {
            try { measureArch(live, owner, i); } catch (e) { /* keep CSS fallback */ }
          }
        })
        .catch(() => { /* keep static <img> fallback */ });
    });
  })();

  // Keyboard: Enter / Space opens the focused work card
  document.querySelectorAll('[data-works-card]').forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
        e.preventDefault();
        card.click();
      }
    });
  });

  // ==========================================================================
  // WORKS: frame intro (same slow pop-up as music player / Live2D) + title intro
  // ==========================================================================
  (function initWorksIntros() {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ----- Frames -----
    const row = document.getElementById('gallery-container');
    if (row && !reduce && 'IntersectionObserver' in window) {
      const cards = Array.from(row.querySelectorAll('.works-frame-col'));
      cards.forEach((c, i) => c.style.setProperty('--i', i));
      row.classList.add('works-intro-armed');
      let timer = null;
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            clearTimeout(timer);
            cards.forEach((c) => c.classList.add('works-in'));
            timer = setTimeout(() => cards.forEach((c) => c.classList.add('intro-done')), 2200 + cards.length * 180 + 150);
          } else {
            clearTimeout(timer);
            cards.forEach((c) => c.classList.remove('works-in', 'intro-done'));
          }
        });
      }, { threshold: 0.2 }).observe(row);
    }

    // ----- Title -----
    const fx = document.getElementById('works-title-fx');
    if (!fx) return;
    const img = fx.querySelector('.works-svg-title-img');
    const grad = fx.querySelector('.works-title-grad');
    const field = fx.querySelector('.works-title-sparkles');

    // gradient layer uses the title SVG itself as a mask (works with any artwork)
    if (img && grad) {
      const probe = new Image();
      probe.onload = () => {
        fx.style.setProperty('--title-mask', 'url("' + img.getAttribute('src') + '")');
        fx.classList.add('fx-ready');
      };
      probe.src = img.getAttribute('src');
    }

    // sparkles: delay follows the write-on beam (left -> right)
    const GLYPHS = ['✦', '✧', '✦', '✦'];
    const N = 18;
    for (let k = 0; k < N; k++) {
      const s = document.createElement('i');
      s.className = 'ws-sparkle';
      s.textContent = GLYPHS[k % GLYPHS.length];
      const x = 4 + Math.random() * 92;
      const y = 8 + Math.random() * 84;
      s.style.setProperty('--x', x.toFixed(1) + '%');
      s.style.setProperty('--y', y.toFixed(1) + '%');
      s.style.setProperty('--s', (5 + Math.random() * 6).toFixed(0) + 'px');
      s.style.setProperty('--delay', (x / 100 * 2.3 + Math.random() * 0.25).toFixed(2) + 's');
      s.style.setProperty('--dur', (1.1 + Math.random() * 0.9).toFixed(2) + 's');
      s.style.setProperty('--idle-dur', (3.2 + Math.random() * 3.5).toFixed(2) + 's');
      s.style.setProperty('--idle-delay', (Math.random() * 5).toFixed(2) + 's');
      field.appendChild(s);
    }

    if (reduce || !('IntersectionObserver' in window)) { fx.classList.add('is-in'); return; }
    let idleTimer = null;
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        clearTimeout(idleTimer);
        if (entry.isIntersecting) {
          fx.classList.add('is-in');
          idleTimer = setTimeout(() => fx.classList.add('is-idle'), 3600);
        } else {
          fx.classList.remove('is-in', 'is-idle');
        }
      });
    }, { threshold: 0.4 }).observe(fx);
  })();

});