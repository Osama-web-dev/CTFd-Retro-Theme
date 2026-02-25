/**
 * ANALOG RETRO BACKGROUND ENGINE — STARGAZE THEME
 * Layers: paper grain, dust particles, analog flicker, corner vignette,
 *         film burn edge, floating cartoon characters, page transitions.
 *
 * NOTE: Custom cursor is handled by retro-cursor.js (loaded separately).
 * All overlay layers use z-index 1–4. Score graph / modals are z≥5.
 * All overlays use pointer-events: none to not block clicks.
 */
(function () {
    'use strict';

    const rand = (min, max) => Math.random() * (max - min) + min;

    function createEl(tag, styles, attrs) {
        const el = document.createElement(tag);
        if (styles) Object.assign(el.style, styles);
        if (attrs) Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
        return el;
    }

    /* ── LAYER 1: PAPER GRAIN TEXTURE ── */
    function initPaperTexture() {
        const svgHolder = createEl('div', { position: 'fixed', width: '0', height: '0', overflow: 'hidden', zIndex: '-1' });
        svgHolder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
      <filter id="paper-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
        <feBlend in="SourceGraphic" mode="multiply"/>
      </filter>
    </svg>`;
        document.body.appendChild(svgHolder);

        const grain = createEl('div', {
            position: 'fixed', top: '0', left: '0',
            width: '100vw', height: '100vh',
            zIndex: '1', pointerEvents: 'none',
            filter: 'url(#paper-grain)', opacity: '0.045',
        });
        grain.id = 'paper-grain-overlay';
        document.body.appendChild(grain);

        const vignette = createEl('div', {
            position: 'fixed', top: '0', left: '0',
            width: '100vw', height: '100vh',
            zIndex: '1', pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 55%, rgba(30,26,22,0.5) 100%)',
        });
        vignette.id = 'retro-vignette';
        document.body.appendChild(vignette);
    }

    /* ── LAYER 2: FLOATING DUST PARTICLES ── */
    function initDustParticles() {
        const container = createEl('div', {
            position: 'fixed', top: '0', left: '0',
            width: '100vw', height: '100vh',
            zIndex: '1', pointerEvents: 'none', overflow: 'hidden',
        });
        container.id = 'dust-container';
        document.body.appendChild(container);

        for (let i = 0; i < 28; i++) {
            const size = rand(1.2, 3);
            const x = rand(0, 100);
            const y = rand(0, 100);
            const dur = rand(18, 50);
            const delay = rand(0, 30);
            const dx = rand(-3, 3);
            const dy = rand(-5, -1);
            const opacity = rand(0.06, 0.22);

            const dust = createEl('div', {
                position: 'absolute',
                left: `${x}vw`, top: `${y}vh`,
                width: `${size}px`, height: `${size}px`,
                borderRadius: '50%',
                background: `rgba(196,169,98,${opacity})`,
                animation: `dust-drift-${i} ${dur}s ${delay}s infinite linear`,
            });

            const style = document.createElement('style');
            style.textContent = `
        @keyframes dust-drift-${i} {
          0%   { transform: translate(0,0) scale(1); opacity: ${opacity}; }
          33%  { transform: translate(${dx * 1.5}vw, ${dy * 0.4}vh) scale(${rand(0.7, 1.1).toFixed(2)}); }
          66%  { transform: translate(${dx * 0.5}vw, ${dy * 0.8}vh) scale(${rand(0.8, 1.2).toFixed(2)}); }
          100% { transform: translate(${dx}vw, ${dy}vh) scale(1); opacity: ${(opacity * 0.4).toFixed(3)}; }
        }
      `;
            document.head.appendChild(style);
            container.appendChild(dust);
        }
    }

    /* ── LAYER 3: ANALOG BRIGHTNESS FLICKER ── */
    function initAnalogFlicker() {
        const flickerStyle = document.createElement('style');
        flickerStyle.textContent = `
      @keyframes analog-flicker-pulse {
        0%   { filter: brightness(1); }
        15%  { filter: brightness(1.035); }
        30%  { filter: brightness(0.982); }
        50%  { filter: brightness(1.02); }
        70%  { filter: brightness(0.99); }
        100% { filter: brightness(1); }
      }
      body.analog-flicker { animation: analog-flicker-pulse 1.8s ease-in-out forwards; }
    `;
        document.head.appendChild(flickerStyle);

        function scheduleFlicker() {
            const delay = rand(20000, 30000);
            setTimeout(() => {
                document.body.classList.add('analog-flicker');
                setTimeout(() => {
                    document.body.classList.remove('analog-flicker');
                    scheduleFlicker();
                }, 1900);
            }, delay);
        }
        scheduleFlicker();
    }

    /* ── LAYER 4: FILM BURN EDGE ── */
    function initFilmBurn() {
        const burn = createEl('div', {
            position: 'fixed', top: '0', left: '0',
            width: '100vw', height: '100vh',
            zIndex: '2', pointerEvents: 'none', opacity: '0',
            background: 'radial-gradient(ellipse at top left, rgba(210,150,50,0.18) 0%, transparent 55%)',
            transition: 'opacity 0.6s ease-in-out',
        });
        burn.id = 'film-burn';
        document.body.appendChild(burn);

        function scheduleFilmBurn() {
            const delay = rand(55000, 80000);
            setTimeout(() => {
                burn.style.opacity = '1';
                setTimeout(() => {
                    burn.style.opacity = '0';
                    scheduleFilmBurn();
                }, 900);
            }, delay);
        }
        scheduleFilmBurn();
    }

    /* ── LAYER 5: FLOATING CARTOON CHARACTERS ── */
    const CHARACTERS = [
        {
            id: 'char-cassette', x: 8, y: 72,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="28" viewBox="0 0 38 28">
        <rect x="1" y="3" width="36" height="22" rx="3" fill="#3b2a1e" stroke="#c4a962" stroke-width="1.5"/>
        <rect x="6" y="7" width="26" height="12" rx="2" fill="#efe2c6"/>
        <circle cx="11" cy="13" r="3.5" fill="#c56a2d" stroke="#3b2a1e" stroke-width="1"/>
        <circle cx="11" cy="13" r="1.2" fill="#3b2a1e"/>
        <circle cx="27" cy="13" r="3.5" fill="#c56a2d" stroke="#3b2a1e" stroke-width="1"/>
        <circle cx="27" cy="13" r="1.2" fill="#3b2a1e"/>
        <rect x="14" y="11" width="10" height="4" rx="1" fill="#2f8f9d" opacity="0.5"/>
        <rect x="15" y="24" width="3" height="2" rx="0.5" fill="#c4a962"/>
        <rect x="20" y="24" width="3" height="2" rx="0.5" fill="#c4a962"/>
      </svg>`,
            dur: 28, dx: 2.5, wink: true,
        },
        {
            id: 'char-floppy', x: 85, y: 55,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="32" viewBox="0 0 28 32">
        <rect x="1" y="1" width="26" height="30" rx="2" fill="#2f8f9d" stroke="#3b2a1e" stroke-width="1.5"/>
        <rect x="4" y="1" width="14" height="10" rx="1" fill="#c4a962"/>
        <rect x="11" y="2" width="4" height="8" rx="0.5" fill="#3b2a1e"/>
        <rect x="3" y="14" width="22" height="14" rx="1" fill="#efe2c6"/>
        <circle cx="10" cy="21" r="2.5" fill="#3b2a1e"/>
        <circle cx="18" cy="21" r="2.5" fill="#3b2a1e"/>
        <path d="M7,25 Q14,28 21,25" stroke="#3b2a1e" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      </svg>`,
            dur: 35, dx: -2, wink: false,
        },
        {
            id: 'char-crt', x: 50, y: 15,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <rect x="2" y="2" width="32" height="26" rx="4" fill="#3b2a1e" stroke="#c4a962" stroke-width="1.5"/>
        <rect x="5" y="5" width="26" height="20" rx="2" fill="#2f8f9d" opacity="0.8"/>
        <circle cx="13" cy="15" r="3" fill="#efe2c6"/>
        <circle cx="23" cy="15" r="3" fill="#efe2c6"/>
        <circle cx="13" cy="15" r="1.5" fill="#1e1a16"/>
        <circle cx="23" cy="15" r="1.5" fill="#1e1a16"/>
        <path d="M12,20 Q18,23 24,20" stroke="#efe2c6" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <rect x="12" y="28" width="12" height="3" rx="1" fill="#c56a2d"/>
        <rect x="10" y="31" width="16" height="3" rx="1" fill="#3b2a1e"/>
      </svg>`,
            dur: 42, dx: 1.5, wink: true,
        },
        {
            id: 'char-hacker', x: 20, y: 30,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
        <ellipse cx="12" cy="9" rx="7" ry="8" fill="#d2b48c" stroke="#3b2a1e" stroke-width="1.2"/>
        <rect x="5" y="6" width="14" height="3" rx="1" fill="#3b2a1e"/>
        <rect x="4" y="5" width="3" height="5" rx="1" fill="#2f8f9d"/>
        <rect x="17" y="5" width="3" height="5" rx="1" fill="#2f8f9d"/>
        <circle cx="9.5" cy="11" r="1.5" fill="#3b2a1e"/>
        <circle cx="14.5" cy="11" r="1.5" fill="#3b2a1e"/>
        <path d="M9,15 Q12,17 15,15" stroke="#3b2a1e" stroke-width="1" fill="none" stroke-linecap="round"/>
        <rect x="7" y="17" width="10" height="12" rx="2" fill="#2f8f9d" stroke="#3b2a1e" stroke-width="1"/>
        <rect x="4" y="18" width="3" height="8" rx="1.5" fill="#3b2a1e"/>
        <rect x="17" y="18" width="3" height="8" rx="1.5" fill="#3b2a1e"/>
        <rect x="8" y="29" width="3" height="7" rx="1.5" fill="#3b2a1e"/>
        <rect x="13" y="29" width="3" height="7" rx="1.5" fill="#3b2a1e"/>
        <text x="5" y="23" font-family="monospace" font-size="5" fill="#efe2c6">&lt;/&gt;</text>
      </svg>`,
            dur: 22, dx: -1.8, wink: false,
        },
        {
            id: 'char-lemon', x: 78, y: 82,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="32" viewBox="0 0 28 32">
        <ellipse cx="14" cy="17" rx="10" ry="11" fill="#c4a962" stroke="#3b2a1e" stroke-width="1.5"/>
        <ellipse cx="14" cy="7"  rx="4"  ry="6"  fill="#c4a962" stroke="#3b2a1e" stroke-width="1"/>
        <ellipse cx="14" cy="28" rx="3"  ry="2.5" fill="#c56a2d" stroke="#3b2a1e" stroke-width="0.8"/>
        <circle cx="11" cy="17" r="1.8" fill="#3b2a1e"/>
        <circle cx="17" cy="17" r="1.8" fill="#3b2a1e"/>
        <path d="M10,22 Q14,25 18,22" stroke="#3b2a1e" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M10,5 Q14,2 18,5" stroke="#c56a2d" stroke-width="1" fill="none" stroke-linecap="round"/>
        <circle cx="11.5" cy="16.5" r="0.5" fill="#efe2c6"/>
        <circle cx="17.5" cy="16.5" r="0.5" fill="#efe2c6"/>
      </svg>`,
            dur: 30, dx: 1.2, wink: true,
        },
        {
            id: 'char-tape', x: 60, y: 88,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="24" viewBox="0 0 32 24">
        <rect x="1" y="1" width="30" height="22" rx="3" fill="#8b2e2e" stroke="#3b2a1e" stroke-width="1.5"/>
        <rect x="4" y="4" width="24" height="14" rx="2" fill="#efe2c6"/>
        <circle cx="10" cy="11" r="4" fill="#c56a2d" stroke="#3b2a1e" stroke-width="1"/>
        <circle cx="10" cy="11" r="1.5" fill="#3b2a1e"/>
        <circle cx="22" cy="11" r="4" fill="#c56a2d" stroke="#3b2a1e" stroke-width="1"/>
        <circle cx="22" cy="11" r="1.5" fill="#3b2a1e"/>
        <path d="M10,19 L10,22" stroke="#c4a962" stroke-width="1.2"/>
        <path d="M18,19 L18,22" stroke="#c4a962" stroke-width="1.2"/>
        <text x="12" y="13" font-family="monospace" font-size="4" fill="#3b2a1e">PLAY</text>
      </svg>`,
            dur: 38, dx: -2.5, wink: false,
        },
    ];

    function initFloatingCharacters() {
        const container = createEl('div', {
            position: 'fixed', top: '0', left: '0',
            width: '100vw', height: '100vh',
            zIndex: '3', pointerEvents: 'none', overflow: 'hidden',
        });
        container.id = 'floating-characters';
        container.setAttribute('aria-hidden', 'true');
        document.body.appendChild(container);

        CHARACTERS.forEach((char, i) => {
            const wrapper = createEl('div', {
                position: 'absolute',
                left: `${char.x}%`, top: `${char.y}%`,
                opacity: `${rand(0.38, 0.55)}`,
                willChange: 'transform',
            });
            wrapper.id = char.id;
            wrapper.dataset.parallaxFactor = rand(0.008, 0.018).toFixed(4);
            wrapper.innerHTML = char.svg;

            const driftX = rand(-1.5, 1.5).toFixed(2);
            const driftY = rand(-1.2, 1.2).toFixed(2);
            const bobDur = rand(4, 8).toFixed(1);
            const rot1 = rand(-3, 3).toFixed(1);
            const rot2 = rand(-5, 5).toFixed(1);
            const rot3 = rand(-3, 3).toFixed(1);
            const rot4 = rand(-2, 2).toFixed(1);
            const bob1 = rand(-8, 8).toFixed(1);
            const bob2 = rand(-6, 4).toFixed(1);

            const style = document.createElement('style');
            style.textContent = `
        @keyframes char-bob-${i} {
          0%   { transform: translateY(0) rotate(${rot1}deg); }
          33%  { transform: translateY(${bob1}px) rotate(${rot2}deg); }
          66%  { transform: translateY(${bob2}px) rotate(${rot3}deg); }
          100% { transform: translateY(0) rotate(${rot4}deg); }
        }
        @keyframes char-drift-${i} {
          0%   { left: ${char.x}%; top: ${char.y}%; }
          50%  { left: calc(${char.x}% + ${driftX}vw); top: calc(${char.y}% + ${driftY}vh); }
          100% { left: ${char.x}%; top: ${char.y}%; }
        }
        #${char.id} {
          animation: char-drift-${i} ${char.dur}s ease-in-out infinite,
                     char-bob-${i} ${bobDur}s ease-in-out infinite;
        }
      `;
            document.head.appendChild(style);

            if (char.wink) {
                const winkDur = rand(6, 14).toFixed(1);
                const winkDelay = rand(0, 8).toFixed(1);
                const winkStyle = document.createElement('style');
                winkStyle.textContent = `
          @keyframes wink-${i} {
            0%, 96%, 100% { transform: scaleY(1); }
            97%            { transform: scaleY(0.1); }
          }
          #${char.id} circle {
            animation: wink-${i} ${winkDur}s ${winkDelay}s infinite;
          }
        `;
                document.head.appendChild(winkStyle);
            }

            container.appendChild(wrapper);
        });

        // Mouse parallax (passive listener — no perf cost)
        let px = 0, py = 0;
        document.addEventListener('mousemove', (e) => {
            px = e.clientX / window.innerWidth - 0.5;
            py = e.clientY / window.innerHeight - 0.5;
            CHARACTERS.forEach(char => {
                const el = document.getElementById(char.id);
                if (!el) return;
                const f = parseFloat(el.dataset.parallaxFactor) * 100;
                el.style.marginLeft = `${px * f}px`;
                el.style.marginTop = `${py * f}px`;
            });
        }, { passive: true });
    }

    /* ── PAGE TRANSITION (Film Dissolve) ── */
    function initPageTransitions() {
        // Read current bg from CSS variable for dark mode compatibility
        const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#f4ead5';
        const overlay = createEl('div', {
            position: 'fixed', top: '0', left: '0',
            width: '100vw', height: '100vh',
            zIndex: '999999', pointerEvents: 'none',
            opacity: '1', transition: 'opacity 0.55s ease-in-out',
        });
        overlay.id = 'page-transition-overlay';
        // Set background via CSS var so dark mode works
        overlay.style.background = `var(--bg, ${bg})`;
        document.body.appendChild(overlay);

        // Fade in on load
        requestAnimationFrame(() => requestAnimationFrame(() => {
            overlay.style.opacity = '0';
        }));

        // Fade out on navigation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript') || link.target === '_blank') return;
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;
            e.preventDefault();
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'all';
            setTimeout(() => { window.location.href = href; }, 520);
        });
    }

    /* ── INIT ── */
    function init() {
        initPaperTexture();
        initDustParticles();
        initAnalogFlicker();
        initFilmBurn();
        initFloatingCharacters();
        // initPageTransitions(); // Disabled per user request to speed up navigation
        // Cursor is handled by retro-cursor.js
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
