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

  // Dedicated cursor sparkle audio: Plays ONLY while mouse is in motion, fades out immediately on stop
  const sparkleAudio = new Audio('assets/Music/sparklele.mp3');
  sparkleAudio.loop = true;
  sparkleAudio.volume = 0; // Starts silent
  const SPARKLE_TARGET_VOLUME = 0.04; // Barely audible, delicate whisper of stardust

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

  if (liveCard && stage && isFinePointer) {
    stage.addEventListener('mousemove', (e) => {
      // Pause autonomous float during active user mouse inspection
      liveCard.classList.remove('auto-hover-float');

      const rect = liveCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 14;

      liveCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      if (liveImg) {
        const transX = ((x - centerX) / centerX) * -8;
        const transY = ((y - centerY) / centerY) * -6;
        liveImg.style.transform = `translate(${transX}px, ${transY}px) scale(1.04)`;
      }
    });

    stage.addEventListener('mouseleave', () => {
      liveCard.style.transform = '';
      if (liveImg) {
        liveImg.style.transform = '';
      }
      // Re-enable autonomous hovering float when mouse leaves
      liveCard.classList.add('auto-hover-float');
    });
  }

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

    navItems.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('data-nav') === currentId) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

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
      image: 'assets/images/girl-and-cat.png',
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

    // Try playing immediately
    startMusic();

    // Start immediately on ANY first user touch, tap, scroll, key, or pointer interaction
    const autoPlayOnActivity = () => {
      startMusic();
      if (isMusicPlaying) {
        ['pointerdown', 'mousemove', 'scroll', 'keydown', 'touchstart'].forEach((evt) => {
          window.removeEventListener(evt, autoPlayOnActivity);
        });
      }
    };
    ['pointerdown', 'mousemove', 'scroll', 'keydown', 'touchstart'].forEach((evt) => {
      window.addEventListener(evt, autoPlayOnActivity, { passive: true });
    });

    if (logoBtn) {
      logoBtn.addEventListener('click', toggleMusic);
      // Right click on logo allows inspecting the full art
      logoBtn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openModal('6');
      });
    }

    if (cardMusicToggle) {
      cardMusicToggle.addEventListener('click', toggleMusic);
    }
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

});
