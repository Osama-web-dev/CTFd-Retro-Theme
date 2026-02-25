/* ============================================================
   EPISODE ZERO — JS Effects Module v2
   Particle system, canvas cursor trail, CRT effects,
   scoreboard crown, scroll reveal, motion toggle
   ============================================================ */

(function () {
    'use strict';

    const CONFIG = {
        particles: {
            count: 50,
            speed: 0.25,
            maxSize: 2.5,
            minSize: 0.5,
            connectionDistance: 120,
            colors: ['#00f0ff', '#ff00c8'],
            glowColors: ['rgba(0,240,255,0.4)', 'rgba(255,0,200,0.4)'],
        },
        cursor: {
            enabled: true,
            sparkCount: 6,          // sparks per frame while moving
            sparkLifetime: 35,      // frames a spark lives
            sparkSpeed: 2.5,
            sparkSizeMax: 4,
            sparkSizeMin: 1.5,
            colors: ['#00f0ff', '#ff00c8', '#7b2fff', '#00e676', '#ffe066'],
            ringSmoothing: 0.12,    // ring lags behind mouse for a smooth feel
        },
        splash: {
            duration: 2000,
            sessionKey: 'ez_splash_shown',
        },
    };

    // ---- Utilities ----
    function prefersReducedMotion() {
        return (
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            document.body.classList.contains('ez-reduced-motion')
        );
    }

    function isMobile() {
        return window.innerWidth <= 768 || 'ontouchstart' in window;
    }

    // ============================================================
    // 1. PARTICLE SYSTEM (background network)
    // ============================================================
    class ParticleSystem {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.animationId = null;
            this.running = false;

            this.resize();
            window.addEventListener('resize', () => this.resize());

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pause();
                } else if (this.running) {
                    this.resume();
                }
            });
        }

        resize() {
            if (!this.canvas) return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        init() {
            if (!this.canvas || prefersReducedMotion()) return;

            this.particles = [];
            const count = isMobile()
                ? Math.min(Math.floor(CONFIG.particles.count / 3), 20)
                : Math.min(CONFIG.particles.count, 60);

            for (let i = 0; i < count; i++) {
                const colorIdx = Math.floor(Math.random() * CONFIG.particles.colors.length);
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: Math.random() * (CONFIG.particles.maxSize - CONFIG.particles.minSize) + CONFIG.particles.minSize,
                    speedX: (Math.random() - 0.5) * CONFIG.particles.speed,
                    speedY: (Math.random() - 0.5) * CONFIG.particles.speed,
                    color: CONFIG.particles.colors[colorIdx],
                    glowColor: CONFIG.particles.glowColors[colorIdx],
                    opacity: Math.random() * 0.5 + 0.2,
                });
            }

            this.running = true;
            this._paused = false;
            this.animate();
        }

        animate() {
            if (!this.running || this._paused || prefersReducedMotion()) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (const p of this.particles) {
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0) p.x = this.canvas.width;
                if (p.x > this.canvas.width) p.x = 0;
                if (p.y < 0) p.y = this.canvas.height;
                if (p.y > this.canvas.height) p.y = 0;

                this.ctx.save();
                this.ctx.globalAlpha = p.opacity;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = p.glowColor;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
                this.ctx.restore();
            }

            // Soft connection lines
            this.ctx.lineWidth = 0.5;
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const dx = this.particles[i].x - this.particles[j].x;
                    const dy = this.particles[i].y - this.particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONFIG.particles.connectionDistance) {
                        this.ctx.globalAlpha = 0.06 * (1 - dist / CONFIG.particles.connectionDistance);
                        this.ctx.strokeStyle = '#00f0ff';
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                        this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                        this.ctx.stroke();
                    }
                }
            }

            this.ctx.globalAlpha = 1;
            this.animationId = requestAnimationFrame(() => this.animate());
        }

        pause() {
            this._paused = true;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }

        resume() {
            if (!this.running) return;
            this._paused = false;
            this.animate();
        }

        stop() {
            this.running = false;
            this._paused = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    }

    // ============================================================
    // 2. CANVAS CURSOR — pixel-perfect ring + spark trail
    // ============================================================
    class CustomCursor {
        constructor() {
            if (isMobile() || prefersReducedMotion()) return;

            // DOM elements for cursor ring + dot
            this.ring = document.getElementById('ez-cursor');
            this.dot = document.getElementById('ez-cursor-dot');
            if (!this.ring || !this.dot) return;

            // Canvas for the spark trail
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'ez-cursor-canvas';
            this.canvas.style.cssText = [
                'position:fixed', 'top:0', 'left:0',
                'width:100%', 'height:100%',
                'pointer-events:none',
                'z-index:9998',           // just below the ring (9999)
                'will-change:transform',
            ].join(';');
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            // State
            this.mx = 0; this.my = 0;          // raw mouse position
            this.rx = 0; this.ry = 0;          // ring smooth position
            this.sparks = [];                  // active spark particles
            this.moving = false;               // is mouse currently moving?
            this.active = false;               // has mouse entered?
            this.hovering = false;             // hovering a clickable?

            this._resize();
            window.addEventListener('resize', () => this._resize());
            this._bindEvents();
            this._loop();
        }

        _resize() {
            if (!this.canvas) return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        _spawnSparks(x, y) {
            const n = CONFIG.cursor.sparkCount;
            for (let i = 0; i < n; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * CONFIG.cursor.sparkSpeed + 0.5;
                const color = CONFIG.cursor.colors[Math.floor(Math.random() * CONFIG.cursor.colors.length)];
                const size = Math.random() * (CONFIG.cursor.sparkSizeMax - CONFIG.cursor.sparkSizeMin) + CONFIG.cursor.sparkSizeMin;
                this.sparks.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color,
                    size,
                    life: CONFIG.cursor.sparkLifetime,
                    maxLife: CONFIG.cursor.sparkLifetime,
                });
            }
        }

        _bindEvents() {
            let lastX = 0, lastY = 0;

            document.addEventListener('mousemove', (e) => {
                this.mx = e.clientX;
                this.my = e.clientY;

                if (!this.active) {
                    this.active = true;
                    this.rx = e.clientX;
                    this.ry = e.clientY;
                    this.ring.classList.add('active');
                    this.dot.classList.add('active');
                }

                // Spawn sparks when mouse has moved enough
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 4) {
                    this._spawnSparks(e.clientX, e.clientY);
                    lastX = e.clientX;
                    lastY = e.clientY;
                }

                // Dot follows mouse exactly
                this.dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            });

            document.addEventListener('mouseleave', () => {
                this.active = false;
                this.ring.classList.remove('active', 'hover', 'click');
                this.dot.classList.remove('active');
            });

            document.addEventListener('mousedown', () => {
                // Burst of sparks on click
                for (let b = 0; b < 4; b++) {
                    this._spawnSparks(this.mx, this.my);
                }
                this.ring.classList.add('click');
                setTimeout(() => this.ring.classList.remove('click'), 150);
            });

            // Hover detection
            const hoverables = 'a, button, input, select, textarea, [role="button"], .challenge-button, .nav-link, .dropdown-item, .btn, .card, label';
            document.addEventListener('mouseover', (e) => {
                if (e.target.closest(hoverables)) {
                    this.ring.classList.add('hover');
                }
            });
            document.addEventListener('mouseout', (e) => {
                if (e.target.closest(hoverables)) {
                    this.ring.classList.remove('hover');
                }
            });
        }

        _drawSparks() {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (let i = this.sparks.length - 1; i >= 0; i--) {
                const s = this.sparks[i];
                s.life--;
                s.x += s.vx;
                s.y += s.vy;
                s.vx *= 0.92;   // friction
                s.vy *= 0.92;
                s.vy += 0.04;   // slight gravity

                if (s.life <= 0) {
                    this.sparks.splice(i, 1);
                    continue;
                }

                const t = s.life / s.maxLife;  // 1 → 0
                const radius = s.size * t;
                const alpha = t * t;            // quadratic fade

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.shadowBlur = 10 * t;
                ctx.shadowColor = s.color;
                ctx.beginPath();
                ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = s.color;
                ctx.fill();
                ctx.restore();
            }
        }

        _loop() {
            // Smooth ring interpolation
            this.rx += (this.mx - this.rx) * CONFIG.cursor.ringSmoothing;
            this.ry += (this.my - this.ry) * CONFIG.cursor.ringSmoothing;
            this.ring.style.transform = `translate3d(${this.rx}px, ${this.ry}px, 0)`;

            // Draw sparks on canvas
            this._drawSparks();

            requestAnimationFrame(() => this._loop());
        }
    }

    // ============================================================
    // 3. SCOREBOARD CROWN ENHANCER
    // ============================================================
    class ScoreboardEnhancer {
        constructor() {
            this.enhance();
            this._observer = new MutationObserver(() => this.enhance());
            const sb = document.getElementById('scoreboard');
            if (sb) {
                this._observer.observe(sb, { childList: true, subtree: true });
            }
        }

        enhance() {
            const scoreboard = document.getElementById('scoreboard');
            if (!scoreboard) return;

            const firstRow = scoreboard.querySelector('table tbody tr:first-child');
            if (!firstRow) return;

            if (firstRow.querySelector('.ez-crown')) return;

            const firstTh = firstRow.querySelector('th');
            if (firstTh) {
                const crown = document.createElement('i');
                crown.className = 'fas fa-crown ez-crown';
                crown.setAttribute('aria-hidden', 'true');
                firstTh.insertBefore(crown, firstTh.firstChild);
            }
        }
    }

    // ============================================================
    // 4. CRT GLITCH (random glitch line)
    // ============================================================
    class CRTGlitch {
        constructor() {
            this.glitch = document.getElementById('ez-crt-glitch');
            if (this.glitch && !prefersReducedMotion()) this._schedule();
        }

        _schedule() {
            const delay = 4000 + Math.random() * 8000;
            setTimeout(() => {
                this._fire();
                this._schedule();
            }, delay);
        }

        _fire() {
            if (!this.glitch || prefersReducedMotion()) return;
            const top = Math.random() * 100;
            this.glitch.style.top = `${top}%`;
            this.glitch.style.opacity = '1';
            setTimeout(() => {
                this.glitch.style.opacity = '0';
            }, 80 + Math.random() * 120);
        }
    }

    // ============================================================
    // 5. SCROLL REVEAL
    // ============================================================
    class ScrollReveal {
        constructor() {
            if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;
            this._targets = document.querySelectorAll('.jumbotron, .card, .tab-content, .alert, footer');
            this._targets.forEach(el => el.classList.add('ez-reveal'));
            this._io = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.classList.add('ez-visible');
                        this._io.unobserve(e.target);
                    }
                });
            }, { threshold: 0.08 });
            this._targets.forEach(el => this._io.observe(el));
        }
    }

    // ============================================================
    // 6. MOTION TOGGLE
    // ============================================================
    class MotionToggle {
        constructor() {
            this.btn = document.getElementById('ez-motion-toggle');
            if (!this.btn) return;
            this.btn.addEventListener('click', () => {
                document.body.classList.toggle('ez-reduced-motion');
                const isReduced = document.body.classList.contains('ez-reduced-motion');
                this.btn.innerHTML = isReduced
                    ? '<i class="fas fa-play"></i> Enable Motion'
                    : '<i class="fas fa-pause"></i> Reduce Motion';
                try {
                    localStorage.setItem('ez_motion_reduced', isReduced ? '1' : '0');
                } catch (e) { /* storage may be blocked */ }
            });

            try {
                if (localStorage.getItem('ez_motion_reduced') === '1') {
                    document.body.classList.add('ez-reduced-motion');
                    this.btn.innerHTML = '<i class="fas fa-play"></i> Enable Motion';
                }
            } catch (e) { /* noop */ }
        }
    }

    // ============================================================
    // 7. SPLASH INTRO (session-once)
    // ============================================================
    class SplashIntro {
        constructor() {
            this.overlay = document.getElementById('ez-splash-overlay');
            if (!this.overlay) return;
            if (sessionStorage.getItem(CONFIG.splash.sessionKey)) {
                this.overlay.style.display = 'none';
                return;
            }
            this.overlay.classList.add('active');
            setTimeout(() => {
                this.overlay.style.transition = 'opacity 400ms ease';
                this.overlay.style.opacity = '0';
                setTimeout(() => {
                    this.overlay.remove();
                    sessionStorage.setItem(CONFIG.splash.sessionKey, '1');
                }, 420);
            }, CONFIG.splash.duration);
        }
    }

    // ============================================================
    // 8. TOOLTIP INIT (Bootstrap 5)
    // ============================================================
    function initTooltips() {
        if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            new bootstrap.Tooltip(el, { trigger: 'hover' });
        });
    }

    // ============================================================
    // BOOT
    // ============================================================
    function boot() {
        new ParticleSystem('ez-particle-canvas').init();
        new CustomCursor();
        new ScoreboardEnhancer();
        new CRTGlitch();
        new ScrollReveal();
        new MotionToggle();
        new SplashIntro();
        initTooltips();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
