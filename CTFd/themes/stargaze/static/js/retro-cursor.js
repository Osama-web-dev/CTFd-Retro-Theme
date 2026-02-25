/**
 * RETRO CURSOR — Episode Zero
 * Design: outer gold ring (no fill) + inner gold solid dot, perfectly centred.
 * Fix: hides until first mousemove to prevent the "snap from corner" on load.
 */
(function () {
    'use strict';

    /* ── CONFIG ── */
    var OUTER_SIZE = 36;   // px — outer ring diameter
    var INNER_SIZE = 8;    // px — inner dot diameter
    var GOLD = '#c4a962';
    var GOLD_DIM = 'rgba(196,169,98,0.35)';
    var TRAIL_MAX = 8;
    var TRAIL_DECAY = 0.06; // opacity lost per frame

    /* ── CREATE ELEMENTS ── */
    var style = document.createElement('style');
    style.textContent = [
        'body { cursor: none !important; }',
        'a, button, input, label, [role="button"], .challenge-button { cursor: none !important; }',
        '#rc-outer {',
        '  position: fixed; top: 0; left: 0;',
        '  width: ' + OUTER_SIZE + 'px; height: ' + OUTER_SIZE + 'px;',
        '  border-radius: 50%;',
        '  border: 1.5px solid ' + GOLD + ';',
        '  background: transparent;',
        '  pointer-events: none;',
        '  z-index: 2147483647;',
        '  will-change: transform;',
        '  opacity: 0;',               /* hidden until first move */
        '  transition: width 0.15s, height 0.15s, border-color 0.15s;',
        '}',
        '#rc-inner {',
        '  position: fixed; top: 0; left: 0;',
        '  width: ' + INNER_SIZE + 'px; height: ' + INNER_SIZE + 'px;',
        '  border-radius: 50%;',
        '  background: ' + GOLD + ';',
        '  pointer-events: none;',
        '  z-index: 2147483647;',
        '  will-change: transform;',
        '  opacity: 0;',               /* hidden until first move */
        '  box-shadow: 0 0 5px rgba(196,169,98,0.6);',
        '}',
    ].join('\n');
    document.head.appendChild(style);

    var outer = document.createElement('div');
    outer.id = 'rc-outer';
    document.body.appendChild(outer);

    var inner = document.createElement('div');
    inner.id = 'rc-inner';
    document.body.appendChild(inner);

    /* ── STATE ── */
    var mx = -9999, my = -9999;   // off-screen until first move
    var ox = -9999, oy = -9999;   // outer (lerps behind inner for a soft lag)
    var visible = false;
    var hovering = false;
    var trails = [];

    /* ── TRAIL FACTORY ── */
    function spawnTrail(x, y) {
        if (trails.length >= TRAIL_MAX) return;
        var el = document.createElement('div');
        el.style.cssText = [
            'position:fixed',
            'top:0', 'left:0',
            'width:5px', 'height:5px',
            'border-radius:50%',
            'background:' + GOLD_DIM,
            'pointer-events:none',
            'z-index:2147483640',
            'will-change:transform',
            'opacity:0.5',
        ].join(';');
        document.body.appendChild(el);
        el.style.transform = 'translate(' + (x - 2.5) + 'px,' + (y - 2.5) + 'px)';
        trails.push({ el: el, opacity: 0.5 });
    }

    /* ── ANIMATION LOOP ── */
    var trailTick = 0;
    function loop() {
        if (visible) {
            /* Outer ring smoothly follows (lerp) */
            ox += (mx - ox) * 0.18;
            oy += (my - oy) * 0.18;

            /* Outer ring: centred on cursor */
            outer.style.transform = 'translate(' + (ox - OUTER_SIZE / 2) + 'px,' + (oy - OUTER_SIZE / 2) + 'px)';
            /* Inner dot: centred exactly on cursor */
            inner.style.transform = 'translate(' + (mx - INNER_SIZE / 2) + 'px,' + (my - INNER_SIZE / 2) + 'px)';

            /* Spawn trail every 3 frames */
            trailTick++;
            if (trailTick % 3 === 0) spawnTrail(mx, my);

            /* Decay trails */
            for (var i = trails.length - 1; i >= 0; i--) {
                trails[i].opacity -= TRAIL_DECAY;
                if (trails[i].opacity <= 0) {
                    if (trails[i].el.parentNode) trails[i].el.parentNode.removeChild(trails[i].el);
                    trails.splice(i, 1);
                } else {
                    trails[i].el.style.opacity = trails[i].opacity;
                }
            }
        }

        requestAnimationFrame(loop);
    }

    /* ── EVENTS ── */
    document.addEventListener('mousemove', function (e) {
        mx = e.clientX;
        my = e.clientY;

        if (!visible) {
            visible = true;
            /* Teleport outer to same spot on first move (no lerp lag) */
            ox = mx; oy = my;
            outer.style.opacity = '1';
            inner.style.opacity = '1';
        }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
        outer.style.opacity = '0';
        inner.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
        if (visible) {
            outer.style.opacity = '1';
            inner.style.opacity = '1';
        }
    });

    /* Hover effect — outer ring expands slightly */
    document.addEventListener('mouseover', function (e) {
        var t = e.target;
        var isInteractive = t.closest('a, button, input, label, [role="button"], .challenge-button, .nav-link');
        if (isInteractive && !hovering) {
            hovering = true;
            outer.style.width = (OUTER_SIZE * 1.5) + 'px';
            outer.style.height = (OUTER_SIZE * 1.5) + 'px';
            outer.style.borderColor = '#e8c97a';
        } else if (!isInteractive && hovering) {
            hovering = false;
            outer.style.width = OUTER_SIZE + 'px';
            outer.style.height = OUTER_SIZE + 'px';
            outer.style.borderColor = GOLD;
        }
    });

    /* Click ripple — quick pulse on outer ring */
    document.addEventListener('click', function () {
        outer.style.transform += ' scale(1.6)';
        outer.style.opacity = '0.3';
        setTimeout(function () {
            outer.style.opacity = '1';
        }, 180);
    });

    /* ── START ── */
    requestAnimationFrame(loop);
})();
