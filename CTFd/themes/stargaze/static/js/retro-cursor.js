/**
 * EPISODE ZERO — PREMIUM GOLD ENERGY CURSOR
 * Elegant Filament Trail + Subtle Particles + Refined Shockwave
 * Smooth • Tapered • Glowing • Cinematic • Theme-Matched
 */

(function () {
    'use strict';

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    if (window.location.pathname.startsWith('/admin')) return;

    const CONFIG = {
        OUTER_SIZE: 30,
        INNER_SIZE: 5,
        GOLD: '#c4a962',
        GOLD_LIGHT: '#e8c97a',
        TRAIL_POINTS: 50,
        LERP: 0.22
    };

    /* ───────────────────────── STYLE ───────────────────────── */

    const style = document.createElement('style');
    style.textContent = `
        body, a, button, input, label, textarea, select,
        [role="button"], .challenge-button, .nav-link {
            cursor: none !important;
        }

        #ez-outer {
            position: fixed;
            top: 0;
            left: 0;
            border-radius: 50%;
            border: 1px solid ${CONFIG.GOLD};
            pointer-events: none;
            z-index: 999999;
            opacity: 0;
            transition: border-color 0.2s ease;
        }

        #ez-inner {
            position: fixed;
            top: 0;
            left: 0;
            border-radius: 50%;
            background: ${CONFIG.GOLD_LIGHT};
            pointer-events: none;
            z-index: 999999;
            opacity: 0;
            box-shadow:
                0 0 6px rgba(196,169,98,0.8),
                0 0 14px rgba(196,169,98,0.5);
        }

        #ez-canvas {
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 999998;
        }
    `;
    document.head.appendChild(style);

    /* ───────────────────────── ELEMENTS ───────────────────────── */

    const outer = document.createElement('div');
    outer.id = 'ez-outer';
    outer.style.width = CONFIG.OUTER_SIZE + 'px';
    outer.style.height = CONFIG.OUTER_SIZE + 'px';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    inner.id = 'ez-inner';
    inner.style.width = CONFIG.INNER_SIZE + 'px';
    inner.style.height = CONFIG.INNER_SIZE + 'px';
    document.body.appendChild(inner);

    const canvas = document.createElement('canvas');
    canvas.id = 'ez-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    /* ───────────────────────── STATE ───────────────────────── */

    let mx = 0, my = 0;
    let ox = 0, oy = 0;
    let visible = false;
    let trail = [];
    let particles = [];

    /* ───────────────────────── PARTICLES ───────────────────────── */

    function spawnParticle(x, y, intensity = 1) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2 * intensity,
            vy: (Math.random() - 0.5) * 2 * intensity,
            life: 1
        });
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.04;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.fillStyle = `rgba(196,169,98,${p.life * 0.7})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* ───────────────────────── ANIMATION ───────────────────────── */

    function animate() {

        if (visible) {

            ox += (mx - ox) * CONFIG.LERP;
            oy += (my - oy) * CONFIG.LERP;

            outer.style.transform =
                `translate(${mx - CONFIG.OUTER_SIZE / 2}px, ${my - CONFIG.OUTER_SIZE / 2}px)`;

            inner.style.transform =
                `translate(${mx - CONFIG.INNER_SIZE / 2}px, ${my - CONFIG.INNER_SIZE / 2}px)`;

            trail.push({ x: mx, y: my });
            if (trail.length > CONFIG.TRAIL_POINTS) trail.shift();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            /* Elegant Gold Filament Trail */
            for (let i = 0; i < trail.length - 1; i++) {

                const alpha = i / trail.length;

                const glowStrength = alpha * 0.9;

                ctx.strokeStyle = `rgba(196,169,98,${glowStrength})`;
                ctx.lineWidth = alpha * 4;

                ctx.beginPath();
                ctx.moveTo(trail[i].x, trail[i].y);
                ctx.lineTo(trail[i + 1].x, trail[i + 1].y);
                ctx.stroke();
            }

            updateParticles();
        }

        requestAnimationFrame(animate);
    }

    /* ───────────────────────── EVENTS ───────────────────────── */

    document.addEventListener('mousemove', (e) => {

        const dx = e.clientX - mx;
        const dy = e.clientY - my;
        const speed = Math.sqrt(dx * dx + dy * dy);

        mx = e.clientX;
        my = e.clientY;

        if (!visible) {
            visible = true;
            ox = mx;
            oy = my;
            outer.style.opacity = '1';
            inner.style.opacity = '1';
        }

        if (speed > 5) {
            spawnParticle(mx, my, speed * 0.1);
        }

    }, { passive: true });

    document.addEventListener('click', (e) => {

        for (let i = 0; i < 12; i++) {
            spawnParticle(e.clientX, e.clientY, 2);
        }

        const shock = document.createElement('div');
        shock.style.position = 'fixed';
        shock.style.width = '30px';
        shock.style.height = '30px';
        shock.style.border = `1px solid ${CONFIG.GOLD_LIGHT}`;
        shock.style.borderRadius = '50%';
        shock.style.pointerEvents = 'none';
        shock.style.left = (e.clientX - 15) + 'px';
        shock.style.top = (e.clientY - 15) + 'px';
        shock.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        shock.style.opacity = '0.9';

        document.body.appendChild(shock);

        requestAnimationFrame(() => {
            shock.style.transform = 'scale(4)';
            shock.style.opacity = '0';
        });

        setTimeout(() => shock.remove(), 400);
    });

    requestAnimationFrame(animate);

})();