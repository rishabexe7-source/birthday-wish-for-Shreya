document.addEventListener('DOMContentLoaded', () => {
    // CONFIG
    const RECIPIENT = 'Shreya';
    const SHORT_MESSAGE = 'Have the best birthday ever, Shreya!';
    // const AUTO_REDIRECT_AFTER_MS = 6200;

    // DOM elements (guarded)
    const greeting = document.getElementById('greeting') || null;
    const wishText = document.getElementById('wishText') || null;
    const blowAirBtn = document.getElementById('blowAirBtn') || null;
    const relightBtn = document.getElementById('relightBtn') || null;
    const confettiRoot = document.getElementById('confettiRoot') || document.getElementById('confetti') || document.getElementById('confettiContainer') || document.body;
    const wishBtn = document.getElementById('wishBtn') || null;
    const nameBtn = document.getElementById('nameBtn') || null;
    const dateText = document.getElementById('dateText') || null;
    const blowBtn = document.getElementById('blowBtn') || blowAirBtn || null;
    const banner = document.getElementById('celebrationBanner') || null;
    const popup = document.getElementById('birthdayPopup') || null;
    const messageCard = document.querySelector('.message-card') || document.querySelector('.message-box') || null;

    // initial UI text
    if (greeting) greeting.textContent = `Happy Birthday, ${RECIPIENT}!`;
    if (wishText) wishText.textContent = SHORT_MESSAGE;
    if (dateText) dateText.textContent = (new Date()).toLocaleDateString();

    // SVG candles: insert into #candlesGroup if present
    const N_CANDLES = 7;
    const candlesGroup = document.getElementById('candlesGroup') || null;
    const svgCandleEls = []; // stores {group, flame}
    if (candlesGroup) {
        for (let i = 0; i < N_CANDLES; i++) {
            const g = document.createElementNS('http://www.w3.org/2000/svg','g');
            g.setAttribute('class','svg-candle');
            const x = 150 + (i+1)*(240/(N_CANDLES+1));
            const y = 138;
            const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width','10'); rect.setAttribute('height','48'); rect.setAttribute('rx','3');
            rect.setAttribute('fill','#fff1c9');
            const wick = document.createElementNS('http://www.w3.org/2000/svg','rect');
            wick.setAttribute('x', x+4); wick.setAttribute('y', y-6); wick.setAttribute('width','2'); wick.setAttribute('height','6'); wick.setAttribute('fill','#4a2a2a');
            const flame = document.createElementNS('http://www.w3.org/2000/svg','path');
            flame.setAttribute('d','M'+(x+5)+' '+(y-6)+' q6 -12 0 -18 q-6 6 0 18 z');
            flame.setAttribute('fill','url(#gFrost)');
            flame.setAttribute('class','svg-flame');
            g.appendChild(rect); g.appendChild(wick); g.appendChild(flame);
            candlesGroup.appendChild(g);
            svgCandleEls.push({group: g, flame});
        }
    }

    // overlay HTML candles (if present in DOM)
    const overlayCandles = Array.from(document.querySelectorAll('.candle') || []);

    // helper to set SVG flames visible/hidden
    function setSvgFlamesVisible(visible) {
        svgCandleEls.forEach(c => {
            if (!c.flame) return;
            c.flame.style.opacity = visible ? '1' : '0';
            c.group.classList.toggle('out', !visible);
        });
    }

    // WebAudio melody (one implementation)
    function playHappyBirthday() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            const freq = {'G4':392,'A4':440,'B4':493.88,'C5':523.25,'D5':587.33,'E5':659.25,'F5':698.46,'G5':783.99};
            const melody = [
                ['G4',0.45],['G4',0.35],['A4',0.9],['G4',0.9],['C5',0.9],['B4',1.1],
                ['G4',0.45],['G4',0.35],['A4',0.9],['G4',0.9],['D5',0.9],['C5',1.1],
                ['G4',0.45],['G4',0.35],['G5',0.9],['E5',0.9],['C5',0.9],['B4',0.9],['A4',1.1],
                ['F5',0.45],['F5',0.35],['E5',0.9],['C5',0.9],['D5',0.9],['C5',1.1]
            ];
            let t = now + 0.05;
            melody.forEach(([n,d])=>{
                const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq[n] || 440;
                const g = ctx.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.12,t+0.01); g.gain.exponentialRampToValueAtTime(0.001,t+d);
                o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+d);
                t += d - 0.02;
            });
        } catch(e) {
            console.warn('Audio blocked', e);
        }
    }

    // confetti spawn (single unified implementation)
    function spawnConfetti(count = 80) {
        if (!confettiRoot) return;
        const colors = ['#ff6b6b','#ffd56b','#67b26f','#6b8bff','#c77dff','#ff9fb1'];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            const size = Math.random() * 10 + 6;
            Object.assign(el.style, {
                position: 'absolute',
                width: size + 'px',
                height: size + 'px',
                left: (Math.random()*100) + '%',
                top: (Math.random()*10) + '%',
                background: colors[Math.floor(Math.random()*colors.length)],
                borderRadius: Math.random() > 0.5 ? '3px' : '50%',
                opacity: '0.95',
                pointerEvents: 'none',
                transform: 'translateY(0)',
                transition: `transform ${1500 + Math.random()*1200}ms cubic-bezier(.2,.8,.2,1), opacity 600ms linear`
            });
            confettiRoot.appendChild(el);
            requestAnimationFrame(() => {
                const tx = (Math.random()-0.5) * 300;
                const ty = 120 + Math.random()*60;
                el.style.transform = `translate(${tx}px, ${ty}%) rotate(${Math.random()*720}deg)`;
            });
            setTimeout(() => { el.style.opacity = '0'; setTimeout(()=>el.remove(),600); }, 1700 + Math.random()*900);
        }
    }

    // sparkle + party pieces effect
    function createSparkleEffect(x, y, container = confettiRoot) {
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'sparkle-particle';
            const size = Math.random() * 8 + 6;
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 60 + 20;
            const tx = Math.cos(angle) * dist + 'px';
            const ty = Math.sin(angle) * (dist * 0.6) + 'px';
            p.style.width = p.style.height = `${size}px`;
            p.style.left = `${x - size / 2}px`;
            p.style.top = `${y - size / 2}px`;
            p.style.setProperty('--tx', tx);
            p.style.setProperty('--ty', ty);
            container.appendChild(p);
            setTimeout(() => p.remove(), 1000);
        }
        const colors = ['#ff6b6b', '#ffd56b', '#c77dff', '#6b8bff', '#ff9fb1'];
        for (let i = 0; i < 10; i++) {
            const el = document.createElement('div');
            el.className = 'party-piece';
            const w = Math.random() * 10 + 6;
            const h = Math.random() * 6 + 4;
            const angle = (Math.random() - 0.5) * 2 * Math.PI;
            const speed = Math.random() * 220 + 120;
            const px = Math.cos(angle) * speed + 'px';
            const py = (Math.sin(angle) * speed + 80) + 'px';
            el.style.width = `${w}px`; el.style.height = `${h}px`;
            el.style.left = `${x - w / 2}px`; el.style.top = `${y - h / 2}px`;
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.style.setProperty('--px', px); el.style.setProperty('--py', py);
            el.style.borderRadius = Math.random() > 0.5 ? '3px' : '50%';
            el.style.animation = `partyPiece ${1200 + Math.random() * 800}ms cubic-bezier(.2,.8,.2,1) forwards`;
            container.appendChild(el);
            setTimeout(() => el.remove(), 2200);
        }
    }

    // typed effect helper
    async function typeText(el, text, delay = 28) {
        if (!el) return;
        el.textContent = '';
        for (const ch of text) {
            el.textContent += ch;
            // eslint-disable-next-line no-await-in-loop
            await new Promise(r => setTimeout(r, delay));
        }
    }

    // relight SVG & overlay candles
    function relight() {
        setSvgFlamesVisible(true);
        overlayCandles.forEach(c => c.classList.remove('out'));
        if (greeting) greeting.textContent = `Happy Birthday, ${RECIPIENT}!`;
        if (wishText) wishText.textContent = SHORT_MESSAGE;
    }

    // highlight message and central burst
    function highlightMessageAndBurst() {
        if (messageCard) {
            messageCard.classList.add('highlight');
            setTimeout(()=>messageCard.classList.remove('highlight'), 3200);
        }
        const cakeArea = document.querySelector('.cake-wrapper, .cake-container, #cakeWrap, .cake-img');
        if (cakeArea) {
            const r = cakeArea.getBoundingClientRect();
            createSparkleEffect(r.left + r.width/2, r.top + r.height * 0.25);
        }
    }

    // main celebrate (extinguish + music + confetti + highlight)
    function celebrateBirthday() {
        if (blowBtn) { blowBtn.disabled = true; setTimeout(()=>{ if (blowBtn) blowBtn.disabled = false; }, 4000); }
        if (banner) banner.classList.add('show');

        // SVG candle tilt then extinguish
        svgCandleEls.forEach((c, i) => {
            c.group.style.transition = 'transform 220ms';
            c.group.style.transform = 'translateX(-6px) rotate(-6deg)';
        });
        setTimeout(() => {
            svgCandleEls.forEach((c, i) => {
                setTimeout(() => {
                    c.group.style.transform = '';
                    if (c.flame) { c.flame.style.transition = 'opacity 420ms'; c.flame.style.opacity = '0'; }
                    const rect = c.group.getBoundingClientRect();
                    createSparkleEffect(rect.left + rect.width/2 + window.scrollX, rect.top + window.scrollY);
                }, i * 110);
            });

            // overlay HTML candles
            overlayCandles.forEach((c, i) => {
                setTimeout(()=> {
                    c.classList.add('out');
                    const rect = c.getBoundingClientRect();
                    createSparkleEffect(rect.left + rect.width/2 + window.scrollX, rect.top + window.scrollY);
                }, i * 120);
            });

            // typed greeting and UI updates
            const final = `Happy Birthday, ${RECIPIENT}!`;
            typeText(greeting, final, 28).then(()=>{
                if (greeting) { greeting.classList.add('celebrate'); setTimeout(()=>greeting.classList.remove('celebrate'),2200); }
            });
            if (wishText) wishText.textContent = 'Make a wish — candles are out!';
            playHappyBirthday();
            spawnConfetti(160);
            highlightMessageAndBurst();

            // redirect after celebration
            setTimeout(()=> { try { window.location.href = 'thanks.html'; } catch(e){/* ignore */} }, AUTO_REDIRECT_AFTER_MS);
        }, 240);
    }

    /* ===== ADDED: Ember generator for realistic candle blow ===== */
    function createEmbers(x, y, container = confettiRoot, count = 8) {
        for (let i = 0; i < count; i++) {
            const e = document.createElement('div');
            e.className = 'ember';
            const size = 4 + Math.random() * 6;
            e.style.width = e.style.height = `${size}px`;
            // small random offset so they don't all originate at exact same pixel
            const offsetX = (Math.random() - 0.5) * 12;
            const offsetY = (Math.random() - 0.5) * 6;
            e.style.left = `${x - size / 2 + offsetX}px`;
            e.style.top = `${y - size / 2 + offsetY}px`;
            // random direction for trajectory (mostly downwards)
            const angle = (Math.random() * Math.PI) - Math.PI/2; // -90deg .. 90deg
            const distX = Math.cos(angle) * (20 + Math.random() * 60);
            const distY = Math.sin(angle) * (12 + Math.random() * 36) + 18;
            e.style.setProperty('--ex', `${distX}px`);
            e.style.setProperty('--ey', `${distY}px`);
            container.appendChild(e);
            // cleanup after animation
            setTimeout(() => { try { e.remove(); } catch (err) { /* ignore */ } }, 1400 + Math.random() * 800);
        }
    }

    /* ===== REPLACE: overlay candle extinguish --> slow burn then out (one-by-one) =====
       We keep existing logic but change the overlayCandles loop to:
       - add 'burning' class to flame element (slows/shortens flame)
       - after short "burn" duration, create embers + sparkle and set 'out'
       - increase per-candle interval to feel natural
    */
    // find overlayCandles again (in case defined earlier)
    const overlayCandlesSafe = Array.from(document.querySelectorAll('.candle') || []);

    // If celebrateBirthday exists below, we patch its internal overlay candle loop by using a wrapper.
    // But to be safe and non-destructive, we also ensure our more-natural extinguish runs when celebrateBirthday fires.
    // We'll hook into celebrateBirthday by wrapping it if available, otherwise ensure blow button uses our sequence.

    function extinguishOverlayCandlesSequentially(startDelay = 0) {
        overlayCandlesSafe.forEach((c, index) => {
            const delay = startDelay + index * 380; // longer gap for realism
            setTimeout(() => {
                const flameEl = c.querySelector('.flame');
                // start slow burning animation
                if (flameEl) {
                    flameEl.classList.add('burning');
                }
                // after slow burn duration, extinguish and spawn embers/sparkles
                const burnDuration = 700 + Math.random() * 500; // 700-1200ms
                setTimeout(() => {
                    const rect = c.getBoundingClientRect();
                    const x = rect.left + rect.width / 2 + window.scrollX;
                    const y = rect.top + window.scrollY;
                    // ember burst
                    createEmbers(x, y, confettiRoot, 6 + Math.floor(Math.random() * 6));
                    // remove burning appearance and set out
                    if (flameEl) { flameEl.classList.remove('burning'); }
                    c.classList.add('out');
                    // small sparkle effect too
                    createSparkleEffect(x, y, confettiRoot);
                }, burnDuration);
            }, delay);
        });
    }

    /* ===== UPDATE: SVG candles extinguish to slow fade/scale then out =====
       Replace immediate opacity=0 with staged fade/scale and embers.
    */
    function extinguishSvgCandlesSequentially(startDelay = 0) {
        svgCandleEls.forEach((c, index) => {
            const delay = startDelay + index * 260;
            setTimeout(() => {
                // give a small tilt to simulate wind push (non-destructive)
                try { c.group.style.transition = 'transform 200ms'; c.group.style.transform = 'translateX(-4px) rotate(-4deg)'; } catch(e){}
                // slow fade/scale of SVG flame
                if (c.flame) {
                    c.flame.style.transition = 'opacity 820ms ease, transform 820ms ease';
                    c.flame.style.opacity = '0.6';
                    c.flame.style.transform = 'scale(0.78)';
                }
                setTimeout(() => {
                    if (c.flame) {
                        c.flame.style.opacity = '0';
                        c.group.classList.add('out');
                        try { c.group.style.transform = ''; } catch(e){}
                        const rect = c.group.getBoundingClientRect();
                        const x = rect.left + rect.width/2 + window.scrollX;
                        const y = rect.top + window.scrollY;
                        createEmbers(x, y, confettiRoot, 5 + Math.floor(Math.random()*4));
                        createSparkleEffect(x, y, confettiRoot);
                    }
                }, 820 + Math.random() * 260);
            }, delay);
        });
    }

    /* ===== WRAP celebrateBirthday to call new extinguish sequences ===== */
    if (typeof celebrateBirthday === 'function') {
        const originalCelebrate = celebrateBirthday;
        celebrateBirthday = function(...args) {
            // first call original to preserve existing behavior (tilt etc.)
            originalCelebrate.apply(this, args);

            // start our slower sequential extinguish for overlay and svg flames (non-destructive)
            // Delay slightly so original tilt/transform runs first
            setTimeout(() => {
                extinguishSvgCandlesSequentially(0);
                extinguishOverlayCandlesSequentially(160);
            }, 140);
        };
    } else {
        // If celebrateBirthday not defined earlier, ensure blow button triggers our sequence
        if (blowBtn) {
            const old = blowBtn.onclick;
            blowBtn.addEventListener('click', (e) => {
                try { if (typeof old === 'function') old.call(blowBtn, e); } catch(e){ /* ignore */ }
                // run the sequences
                extinguishSvgCandlesSequentially(0);
                extinguishOverlayCandlesSequentially(160);
            });
        }
    }

    // event hookups (guarded)
    if (blowAirBtn) blowAirBtn.addEventListener('click', celebrateBirthday);
    if (blowBtn && blowBtn !== blowAirBtn) blowBtn.addEventListener('click', celebrateBirthday);
    if (relightBtn) relightBtn.addEventListener('click', relight);
    if (wishBtn) wishBtn.addEventListener('click', () => { spawnConfetti(80); playHappyBirthday(); });
    if (nameBtn) nameBtn.addEventListener('click', () => {
        const name = prompt('Enter recipient name:', RECIPIENT);
        if (name !== null && greeting) greeting.textContent = `Happy Birthday, ${name}!`;
    });

    // safe exposure
    try { window.celebrateBirthday = celebrateBirthday; window.relightCandles = relight; } catch(e){/* ignore */ }
});

(function adjustCandlePositions() {
    const offsetsMm = [10, 20, 0.5, 20, 10]; // mm for candle 1..5
    const MM_TO_PX = 96 / 25.4;

    function mmToPx(mm) {
        return mm * MM_TO_PX;
    }

    function applyOffsets(svgCandleElsLocal, overlayCandlesLocal) {
        for (let i = 0; i < offsetsMm.length; i++) {
            const pxVal = Math.round(mmToPx(offsetsMm[i]) * 10) / 10 + 'px';

            // SVG candles (if available as array of {group, flame})
            if (Array.isArray(svgCandleElsLocal) && svgCandleElsLocal[i] && svgCandleElsLocal[i].group) {
                const g = svgCandleElsLocal[i].group;
                // store original transform once
                if (!g.dataset.origTransform) {
                    g.dataset.origTransform = g.style.transform || g.getAttribute('transform') || '';
                }
                // apply via style.transform (preserve original)
                const base = g.dataset.origTransform ? g.dataset.origTransform + ' ' : '';
                g.style.transform = base + `translateY(${pxVal})`;
                // Also set transform attribute for compatibility (append translate)
                try {
                    const attrBase = g.getAttribute('transform') || '';
                    if (!g.dataset.origAttrTransform) g.dataset.origAttrTransform = attrBase;
                    g.setAttribute('transform', (g.dataset.origAttrTransform ? g.dataset.origAttrTransform + ' ' : '') + `translate(0,${pxVal})`);
                } catch (e) { /* ignore */ }
            }

            // Overlay HTML candles (.candle elements)
            if (Array.isArray(overlayCandlesLocal) && overlayCandlesLocal[i]) {
                const el = overlayCandlesLocal[i];
                if (!el.dataset.origTransform) el.dataset.origTransform = el.style.transform || '';
                const base = el.dataset.origTransform ? el.dataset.origTransform + ' ' : '';
                el.style.transform = base + `translateY(${pxVal})`;
            }
        }
    }

    // Try use existing variables if present in this scope, else query DOM
    let tries = 0;
    function tryApply() {
        tries++;
        const svgEls = (typeof svgCandleEls !== 'undefined' && Array.isArray(svgCandleEls) && svgCandleEls.length) ? svgCandleEls
                      : (function querySvg() {
                            const group = document.getElementById('candlesGroup');
                            if (!group) return [];
                            return Array.from(group.querySelectorAll('g')).map(g => ({ group: g, flame: g.querySelector('.svg-flame') }));
                        })();
        const overlayEls = (typeof overlayCandles !== 'undefined' && Array.isArray(overlayCandles) && overlayCandles.length) ? overlayCandles
                          : Array.from(document.querySelectorAll('.candle') || []);

        if ((svgEls && svgEls.length >= offsetsMm.length) || overlayEls.length >= offsetsMm.length) {
            applyOffsets(svgEls, overlayEls);
            return true;
        }

        if (tries < 30) {
            // retry shortly (elements may be created slightly later)
            setTimeout(tryApply, 120);
            return false;
        }

        // fallback: still apply to whatever exists
        applyOffsets(svgEls, overlayEls);
        return false;
    }

    // Run after short delay so initial creation complete, but also try immediately
    tryApply();
})();

(function nudgeAllCandlesDown2mm(){
    // convert 2 mm to px (assuming 96 DPI)
    const mm = 2;
    const MM_TO_PX = 96 / 25.4;
    const px = mm * MM_TO_PX;
    const pxStr = (Math.round(px * 10) / 10) + 'px'; // e.g. "7.6px"

    // SVG candle groups (try existing svgCandleEls, fallback to querying DOM)
    const svgGroups = (typeof svgCandleEls !== 'undefined' && Array.isArray(svgCandleEls) && svgCandleEls.length)
        ? svgCandleEls.map(c => c.group).filter(Boolean)
        : (Array.from(document.querySelectorAll('#candlesGroup g')) || []);

    svgGroups.forEach(g => {
        try {
            if (!g) return;
            if (!g.dataset.origTransform) g.dataset.origTransform = g.style.transform || g.getAttribute('transform') || '';
            const base = g.dataset.origTransform ? g.dataset.origTransform + ' ' : '';
            // apply via style.transform (preserve original)
            g.style.transform = base + `translateY(${pxStr})`;
            // also append transform attribute for SVG compatibility (use numeric px -> number)
            const attrBase = g.dataset.origAttrTransform || g.getAttribute('transform') || '';
            if (!g.dataset.origAttrTransform) g.dataset.origAttrTransform = attrBase;
            // use translate(0,NUMBER) so SVG transform works (no "px")
            g.setAttribute('transform', (g.dataset.origAttrTransform ? g.dataset.origAttrTransform + ' ' : '') + `translate(0,${(Math.round(px*10)/10)})`);
        } catch (e) {
            /* non-fatal */
            // console.warn('nudge svg candle failed', e);
        }
    });

    // Overlay HTML candles (.candle) (try existing overlayCandles, fallback to query)
    const overlays = (typeof overlayCandles !== 'undefined' && Array.isArray(overlayCandles) && overlayCandles.length)
        ? overlayCandles
        : Array.from(document.querySelectorAll('.candle') || []);

    overlays.forEach(el => {
        try {
            if (!el) return;
            if (!el.dataset.origTransform) el.dataset.origTransform = el.style.transform || '';
            const base = el.dataset.origTransform ? el.dataset.origTransform + ' ' : '';
            el.style.transform = base + `translateY(${pxStr})`;
        } catch (e) {
            /* non-fatal */
            // console.warn('nudge overlay candle failed', e);
        }
    });
})();

(function addExtraPartyEffectsWrapper(){
    // Do nothing if already applied
    if (window.__extraPartyEffectsApplied) return;
    window.__extraPartyEffectsApplied = true;

    // create a shared container for extra party visuals
    const extraLayer = document.createElement('div');
    extraLayer.className = 'extra-party-layer';
    document.body.appendChild(extraLayer);

    // helper: random int
    function rInt(min, max){ return Math.floor(min + Math.random() * (max - min + 1)); }

    // spawn ribbons across the top -> fall
    function spawnRibbons(count = 8) {
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'ribbon-strip';
            const hue = rInt(320, 360);
            el.style.background = `linear-gradient(180deg,hsl(${hue}deg 80% 65%), hsl(${hue-20}deg 75% 55%))`;
            el.style.left = `${Math.random() * 95}%`;
            el.style.top = `${-rInt(10, 30)}vh`;
            el.style.transform = `rotate(${rInt(-25,25)}deg)`;
            el.style.animationDelay = `${Math.random() * 300}ms`;
            el.style.opacity = 0;
            extraLayer.appendChild(el);
            // remove after finished
            setTimeout(()=> {
                el.classList.add('party-fade-out');
                setTimeout(()=> el.remove(), 900);
            }, 2600 + Math.random() * 600);
        }
    }

    // spawn star sparkles drifting
    function spawnStarSparkles(count = 12) {
        for (let i = 0; i < count; i++) {
            const s = document.createElement('div');
            s.className = 'star-sparkle';
            s.style.left = `${20 + Math.random()*60}%`;
            s.style.top = `${10 + Math.random()*30}%`;
            s.style.animationDelay = `${Math.random() * 400}ms`;
            extraLayer.appendChild(s);
            setTimeout(()=> { s.classList.add('party-fade-out'); setTimeout(()=> s.remove(), 800); }, 2600 + Math.random()*600);
        }
    }

    // spawn extra confetti around the cake area
    function spawnExtraConfettiFrom(xPct = 50, yPct = 30, count = 28) {
        const box = extraLayer;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        for (let i = 0; i < count; i++) {
            const c = document.createElement('div');
            c.className = 'extra-confetti';
            const left = (xPct/100) * vw + (Math.random()-0.5) * 260;
            const top = (yPct/100) * vh + (Math.random()-0.5) * 200;
            c.style.left = `${left}px`;
            c.style.top = `${top}px`;
            c.style.background = `linear-gradient(45deg, hsl(${rInt(0,40)} 85% 62%), hsl(${rInt(200,320)} 75% 65%))`;
            c.style.animationDelay = `${Math.random()*200}ms`;
            extraLayer.appendChild(c);
            setTimeout(()=> { c.remove(); }, 2600 + Math.random()*900);
        }
    }

    // small audible chime sequence (complements existing melody)
    function playPartyChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            const freqs = [880, 660, 880, 1100];
            freqs.forEach((f, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'triangle';
                o.frequency.value = f;
                g.gain.value = 0;
                g.gain.setValueAtTime(0, now + i*0.15);
                g.gain.linearRampToValueAtTime(0.18, now + i*0.15 + 0.02);
                g.gain.exponentialRampToValueAtTime(0.001, now + i*0.15 + 0.26);
                o.connect(g); g.connect(ctx.destination);
                o.start(now + i*0.15); o.stop(now + i*0.15 + 0.26);
            });
        } catch(e) { /* ignore audio errors */ }
    }

    // fireworks simple canvas implementation
    function launchFireworks(duration = 2200) {
        const canvas = document.createElement('canvas');
        canvas.className = 'fireworks-canvas';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        extraLayer.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const particles = [];

        function spawnFire(x, y) {
            const baseCount = 28 + Math.floor(Math.random() * 36);
            for (let i = 0; i < baseCount; i++) {
                particles.push({
                    x, y,
                    vx: (Math.random()-0.5) * (6 + Math.random()*14),
                    vy: (Math.random()-0.7) * (6 + Math.random()*18),
                    life: 60 + Math.random()*60,
                    color: `hsl(${rInt(0,360)} ${rInt(70,95)}% ${rInt(50,70)}%)`,
                    size: 1 + Math.random()*3
                });
            }
        }

        // spawn a few fireworks across upper area
        const fcount = 3 + Math.floor(Math.random()*4);
        for (let i = 0; i < fcount; i++) {
            const x = (0.2 + Math.random()*0.6) * canvas.width;
            const y = (0.08 + Math.random()*0.25) * canvas.height;
            setTimeout(()=> spawnFire(x, y), i * 220 + 60);
        }

        let frames = 0;
        const raf = setInterval(()=> {
            frames++;
            ctx.clearRect(0,0,canvas.width, canvas.height);
            for (let i = particles.length -1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08; // gravity
                p.life -= 1;
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                ctx.fill();
                if (p.life <= 0 || p.y > canvas.height + 80) particles.splice(i,1);
            }
            if (frames > (duration/16) && particles.length === 0) {
                clearInterval(raf);
                canvas.classList.add('party-fade-out');
                setTimeout(()=> canvas.remove(), 600);
            }
        }, 16);
    }

    // burst flash element
    function createBurstFlash() {
        const f = document.createElement('div');
        f.className = 'burst-flash';
        extraLayer.appendChild(f);
        setTimeout(()=> { f.remove(); }, 700);
    }

    // orchestrator: run many of these in a pleasing sequence
    function runExtraPartySequence() {
        spawnRibbons(rInt(6,10));
        spawnStarSparkles(rInt(10,18));
        // spawn extra confetti centered roughly on cake area if possible
        const cakeArea = document.querySelector('.cake-wrapper, .cake-container, #cakeWrap, .cake-img');
        let xPct = 50, yPct = 28;
        if (cakeArea) {
            const r = cakeArea.getBoundingClientRect();
            xPct = (r.left + r.width/2) / window.innerWidth * 100;
            yPct = (r.top + r.height*0.25) / window.innerHeight * 100;
        }
        spawnExtraConfettiFrom(xPct, yPct, rInt(18,36));
        // fireworks & flash
        setTimeout(()=> createBurstFlash(), 140);
        setTimeout(()=> launchFireworks(1800), 200);
        // staggered extra confetti later
        setTimeout(()=> spawnExtraConfettiFrom(xPct, yPct, rInt(12,20)), 600);
        // chime
        setTimeout(()=> playPartyChime(), 80);
    }

    // wrapper the existing celebrateBirthday (non-destructive)
    function wrapCelebrate() {
        if (typeof window.celebrateBirthday === 'function' && !window.__celebrateWrapped) {
            const orig = window.celebrateBirthday;
            window.celebrateBirthday = function(...args){
                try { orig.apply(this, args); } catch(e){ try{ orig(...args);}catch(e){} }
                // run extra effects shortly after original actions (so flames/out etc. occur first)
                setTimeout(()=> runExtraPartySequence(), 420);
            };
            window.__celebrateWrapped = true;
        } else {
            // if celebrateBirthday not present, attach to known blow button(s)
            const btn = document.getElementById('blowBtn') || document.getElementById('blowAirBtn');
            if (btn && !btn.__extraAttached) {
                btn.addEventListener('click', ()=> { setTimeout(()=> runExtraPartySequence(), 420); });
                btn.__extraAttached = true;
            }
        }
    }

    // attempt immediate wrap, else retry a few times (in case script load order)
    (function attemptWrap(tries = 0){
        try { wrapCelebrate(); }
        catch(e){}
        if (!window.__celebrateWrapped && tries < 8) setTimeout(()=> attemptWrap(tries+1), 180);
    })();

})();
fetch('cake.html')
  .then(response => response.text())
  .then(html => {
    const cakeDiv = document.getElementById('cakeContainer');
    if (cakeDiv) {
      cakeDiv.innerHTML = html;
      cakeDiv.style.display = 'block';
    }
  })
  .catch(err => console.error('Failed to load cake.html:', err));



(function replacePartyEffectsWithSimple(){
    // remove previous complex extra layer if present (undo previous change)
    const prev = document.querySelector('.extra-party-layer');
    if (prev) prev.remove();
    if (document.getElementById('simplePartyLayer')) return;

    const layer = document.createElement('div');
    layer.id = 'simplePartyLayer';
    document.body.appendChild(layer);

    function randInt(min, max){ return Math.floor(min + Math.random() * (max - min + 1)); }

    function spawnSprinkles(count = 40) {
        const vw = window.innerWidth, vh = window.innerHeight;
        const colors = ['#ff9fb1','#ffd56b','#c77dff','#6b8bff','#ff6b6b'];
        for (let i = 0; i < count; i++) {
            const s = document.createElement('div');
            s.className = 'sprinkle ' + (Math.random() > 0.8 ? 'large' : (Math.random() > 0.6 ? 'small' : ''));
            const size = 6 + Math.random() * 10;
            s.style.width = s.style.height = size + 'px';
            s.style.left = (10 + Math.random() * 80) + '%';
            s.style.top = (window.innerHeight - 40) + 'px';
            s.style.background = colors[randInt(0, colors.length - 1)];
            s.style.animationDelay = (Math.random() * 500) + 'ms';
            layer.appendChild(s);
            setTimeout(() => s.remove(), 2200 + Math.random() * 1000);
        }
    }

    function spawnBalloons(count = 6) {
        const emojis = ['🎈','🎀','💖','🎊','🎉'];
        for (let i = 0; i < count; i++) {
            const b = document.createElement('div');
            b.className = 'balloon';
            b.textContent = emojis[randInt(0, emojis.length - 1)];
            const left = 8 + Math.random() * 84;
            b.style.left = left + '%';
            b.style.fontSize = (28 + Math.random() * 36) + 'px';
            const dur = 3000 + Math.random() * 2400;
            b.style.animationDuration = dur + 'ms';
            b.style.animationDelay = (Math.random() * 300) + 'ms';
            layer.appendChild(b);
            setTimeout(() => b.remove(), dur + 400);
        }
    }

    function spawnPopup(text = 'Happy Birthday!', delay = 0) {
        const p = document.createElement('div');
        p.className = 'popup-ground';
        p.textContent = text;
        const leftOffset = (50 + (Math.random() - 0.5) * 18);
        p.style.left = leftOffset + '%';
        p.style.animationDelay = delay + 'ms';
        layer.appendChild(p);
        setTimeout(() => p.remove(), 2100 + delay);
    }

    function runSimpleParty() {
        spawnSprinkles(56);
        spawnBalloons(8);
        setTimeout(() => spawnSprinkles(36), 300);
        setTimeout(() => spawnBalloons(6), 500);
        spawnPopup('Make a wish!', 120);
        setTimeout(() => spawnPopup('Happy Birthday Shreya!', 420), 420);
    }

    // Wrap existing celebrateBirthday non-destructively OR attach to blow button
    if (typeof window.celebrateBirthday === 'function' && !window.__simplePartyWrapped) {
        const orig = window.celebrateBirthday;
        const cakeIframe = document.getElementById('cakeContainer');
        if (cakeIframe) {
             cakeIframe.style.display = 'block';
            }

        window.celebrateBirthday = function(...args) {
            try { orig.apply(this, args); } catch(e) { try { orig(...args); } catch(e) {} }
            setTimeout(() => runSimpleParty(), 420);
        };
        window.__simplePartyWrapped = true;
    } else {
        const btn = document.getElementById('blowBtn') || document.getElementById('blowAirBtn');
        if (btn && !btn.__simpleAttached) {
            btn.addEventListener('click', () => setTimeout(() => runSimpleParty(), 420));
            btn.__simpleAttached = true;
        }
    }
})();

/* ===== ADDED: hide floating emojis initially and reveal on blow button press =====
   - Manage visibility of elements with class "floating" or within ".decoration" containers
   - Use CSS animation play state and opacity for control
   - Non-destructive: preserves existing inline styles and animations
*/
(function manageFloatingEmojis() {
    const FLOAT_SELECTOR = '.floating, .decoration .balloon, .decoration-elements .balloon';
    // hide/ pause any floating elements immediately (non-destructive)
    function hideFloating() {
        document.querySelectorAll(FLOAT_SELECTOR).forEach(el => {
            // preserve any inline style values
            if (!el.dataset._origOpacity) el.dataset._origOpacity = el.style.opacity || '';
            if (!el.dataset._origAnimState) el.dataset._origAnimState = el.style.animationPlayState || '';
            el.classList.remove('revealed');
            el.style.animationPlayState = 'paused';
            el.style.opacity = '0';
        });
    }

    // reveal and resume animations
    function revealFloating() {
        document.querySelectorAll(FLOAT_SELECTOR).forEach(el => {
            el.classList.add('revealed');
            // restore animation play state running (use class for CSS priority)
            el.style.animationPlayState = 'running';
            el.style.opacity = el.dataset._origOpacity || '1';
        });
    }

    // run hide immediately (safe if elements not present yet)
    try { hideFloating(); } catch (e) { /* ignore */ }

    // attach reveal to blow button(s) non-destructively
    const blowButtons = Array.from(new Set([
        document.getElementById('blowBtn'),
        document.getElementById('blowAirBtn'),
        document.getElementById('blowButton'),
    ])).filter(Boolean);

    blowButtons.forEach(btn => {
        // ensure we don't add multiple identical listeners
        if (!btn.__floatingRevealAttached) {
            btn.addEventListener('click', () => {
                // reveal immediately, before other celebration effects
                try { revealFloating(); } catch (e) { /* ignore */ }
            });
            btn.__floatingRevealAttached = true;
        }
    });

    // Also reveal when celebrateBirthday is triggered programmatically
    if (typeof window.celebrateBirthday === 'function' && !window.__floatingWrapped) {
        const orig = window.celebrateBirthday;
        window.celebrateBirthday = function(...args) {
            try { revealFloating(); } catch (e) { /* ignore */ }
            return orig.apply(this, args);
        };
        window.__floatingWrapped = true;
    }

    // Expose for debugging if needed
    try { window._revealFloatingEmojis = revealFloating; window._hideFloatingEmojis = hideFloating; } catch(e){/*ignore*/}
})();
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault(); // stop immediate navigation
    
    const href = this.href;
    
    document.body.classList.add('fade-out'); // start fade-out animation
    
    setTimeout(() => {
      window.location.href = href; // navigate after animation completes
    }, 500); // match this duration with your CSS animation time
  });
});
document.getElementById('continueBtn').classList.add('show-btn');