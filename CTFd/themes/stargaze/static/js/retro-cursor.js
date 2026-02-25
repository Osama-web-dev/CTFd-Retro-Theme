/**
 * RETRO CURSOR — STARGAZE THEME
 * Separate cursor + analog background engine
 * Uses requestAnimationFrame only, max 10 trail particles
 */
(function () {
    'use strict';

    const rand = (a, b) => Math.random() * (b - a) + a;

    /* ── CURSOR SVG STRINGS ── */
    const ARROW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <polygon points="3,2 3,18 8,13 11,20 13,19 10,12 17,12"
      fill="#2f8f9d" stroke="#3b2a1e" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`;

    const HAND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <rect x="7" y="2" width="2.5" height="9" rx="1.2" fill="#2f8f9d" stroke="#3b2a1e" stroke-width="1"/>
    <rect x="10" y="1" width="2.5" height="10" rx="1.2" fill="#2f8f9d" stroke="#3b2a1e" stroke-width="1"/>
    <rect x="13" y="2" width="2.5" height="9" rx="1.2" fill="#2f8f9d" stroke="#3b2a1e" stroke-width="1"/>
    <path d="M5,10 Q5,7 7,8 L7,14 Q5,15 5,12 Z" fill="#2f8f9d" stroke="#3b2a1e" stroke-width="1"/>
    <rect x="5" y="13" width="12" height="7" rx="2" fill="#2f8f9d" stroke="#3b2a1e" stroke-width="1"/>
  </svg>`;

    let mx = 0, my = 0;
    let prevX = 0, prevY = 0;
    let isPointer = false;
    let cursorEl, dotEl, rippleLayer;
    const trail = [];
    const MAX_TRAIL = 10;
    let animFrame;

    /* ── STYLE INJECTION ── */
    function injectStyles() {
        const s = document.createElement('style');
        s.id = 'retro-cursor-styles';
        s.textContent = `
      *, *::before, *::after { cursor: none !important; }
      #rc-cursor, #rc-dot, #rc-ripple { pointer-events: none !important; }
      @keyframes rc-inkstamp {
        0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.8; }
        100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
      }
      @keyframes rc-dustfade {
        0%   { transform: scale(1) translateY(0); opacity: 0.65; }
        100% { transform: scale(0) translateY(-10px); opacity: 0; }
      }
    `;
        document.head.appendChild(s);
    }

    /* ── DOM BUILD ── */
    function buildDOM() {
        cursorEl = document.createElement('div');
        cursorEl.id = 'rc-cursor';
        Object.assign(cursorEl.style, {
            position: 'fixed', top: '0', left: '0',
            width: '22px', height: '22px',
            zIndex: '2147483647',
            pointerEvents: 'none',
            willChange: 'transform',
            userSelect: 'none',
        });
        cursorEl.innerHTML = ARROW_SVG;

        dotEl = document.createElement('div');
        dotEl.id = 'rc-dot';
        Object.assign(dotEl.style, {
            position: 'fixed', top: '0', left: '0',
            width: '4px', height: '4px', borderRadius: '50%',
            background: '#c4a962',
            zIndex: '2147483647',
            pointerEvents: 'none',
        });

        rippleLayer = document.createElement('div');
        rippleLayer.id = 'rc-ripple';
        Object.assign(rippleLayer.style, {
            position: 'fixed', top: '0', left: '0',
            width: '100vw', height: '100vh',
            zIndex: '2147483646',
            pointerEvents: 'none',
            overflow: 'hidden',
        });

        document.body.appendChild(cursorEl);
        document.body.appendChild(dotEl);
        document.body.appendChild(rippleLayer);
    }

    /* ── LOOP ── */
    function loop() {
        cursorEl.style.transform = `translate(${mx}px,${my}px)`;
        dotEl.style.transform = `translate(${mx - 2}px,${my - 2}px)`;

        // Prune dead trail particles
        for (let i = trail.length - 1; i >= 0; i--) {
            if (!trail[i].isConnected) trail.splice(i, 1);
        }

        animFrame = requestAnimationFrame(loop);
    }

    /* ── EVENTS ── */
    function onMouseMove(e) {
        mx = e.clientX;
        my = e.clientY;

        const dx = mx - prevX, dy = my - prevY;
        if (dx * dx + dy * dy > 100 && trail.length < MAX_TRAIL && Math.random() < 0.5) {
            spawnDust(mx, my);
            prevX = mx; prevY = my;
        }
    }

    function spawnDust(x, y) {
        const d = document.createElement('div');
        const size = rand(2, 4);
        Object.assign(d.style, {
            position: 'fixed',
            left: `${x + rand(-6, 6)}px`,
            top: `${y + rand(-6, 6)}px`,
            width: `${size}px`, height: `${size}px`,
            borderRadius: '50%',
            background: `rgba(196,169,98,${rand(0.4, 0.65)})`,
            animation: `rc-dustfade ${rand(0.4, 0.9).toFixed(2)}s ease-out forwards`,
            zIndex: '2147483645',
            pointerEvents: 'none',
        });
        rippleLayer.appendChild(d);
        trail.push(d);
        setTimeout(() => { if (d.parentNode) d.remove(); }, 900);
    }

    function onMouseClick(e) {
        const rip = document.createElement('div');
        Object.assign(rip.style, {
            position: 'fixed',
            left: `${e.clientX}px`, top: `${e.clientY}px`,
            width: '30px', height: '30px',
            borderRadius: '50%',
            border: '2px solid rgba(196,169,98,0.7)',
            background: 'rgba(196,169,98,0.12)',
            animation: 'rc-inkstamp 0.5s ease-out forwards',
            zIndex: '2147483645',
            pointerEvents: 'none',
        });
        rippleLayer.appendChild(rip);
        setTimeout(() => { if (rip.parentNode) rip.remove(); }, 550);
    }

    function onMouseOver(e) {
        const target = e.target;
        const hoverEl = target.closest('a, button, [role="button"], input, select, textarea, label, .challenge-button, .nav-link, .btn, .dropdown-item, .page-link, .clickable');
        const nowPointer = !!hoverEl;
        if (nowPointer !== isPointer) {
            isPointer = nowPointer;
            cursorEl.innerHTML = isPointer ? HAND_SVG : ARROW_SVG;
        }
    }

    /* ── INIT ── */
    function init() {
        injectStyles();
        buildDOM();
        document.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('click', onMouseClick, { passive: true });
        document.addEventListener('mouseover', onMouseOver, { passive: true });
        // Hide cursor if mouse leaves window
        document.addEventListener('mouseleave', () => {
            cursorEl.style.opacity = '0';
            dotEl.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursorEl.style.opacity = '1';
            dotEl.style.opacity = '1';
        });
        animFrame = requestAnimationFrame(loop);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
