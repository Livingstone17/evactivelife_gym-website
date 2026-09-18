// script.js — Evaactivelife: Theme Toggle + Carousel + 3D Effects

(function () {
    'use strict';

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const ease = 'cubic-bezier(.16,1,.3,1)';

    /* ══════════════════════════════════════════════════════════════
       THEME TOGGLE  (persists to localStorage)
       ══════════════════════════════════════════════════════════════ */
    const html = document.documentElement;
    const toggleBtn = $('#theme-toggle');
    const STORAGE_KEY = 'eva-theme';

    // Restore saved preference, fallback to 'dark'
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        html.setAttribute('data-theme', saved);
    } else {
        html.setAttribute('data-theme', 'dark');
    }

    // Update meta theme-color
    function updateMetaColor() {
        const theme = html.getAttribute('data-theme');
        const meta = $('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a0f' : '#f5f5f7');
    }
    updateMetaColor();

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem(STORAGE_KEY, next);
            updateMetaColor();
        });
    }

    /* ══════════════════════════════════════════════════════════════
       NAV SCROLL
       ══════════════════════════════════════════════════════════════ */
    const nav = $('#nav');
    function onScroll() {
        if (window.scrollY > 40) nav.classList.add('nav--scrolled');
        else nav.classList.remove('nav--scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ══════════════════════════════════════════════════════════════
       MOBILE MENU
       ══════════════════════════════════════════════════════════════ */
    const toggle = $('.nav__toggle');
    const mobileMenu = $('#mobile-menu');

    if (toggle && mobileMenu) {
        toggle.addEventListener('click', () => {
            const open = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!open));
            mobileMenu.classList.toggle('open');
        });
        $$('a', mobileMenu).forEach((a) =>
            a.addEventListener('click', () => {
                toggle.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('open');
            })
        );
    }

    /* ══════════════════════════════════════════════════════════════
       REVEAL ON SCROLL
       ══════════════════════════════════════════════════════════════ */
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
        const rio = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('visible');
                        rio.unobserve(e.target);
                    }
                }),
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        reveals.forEach((el) => rio.observe(el));
    }

    /* ══════════════════════════════════════════════════════════════
       ANIMATED COUNTERS
       ══════════════════════════════════════════════════════════════ */
    const counters = $$('[data-count]');
    if ('IntersectionObserver' in window && counters.length) {
        const cio = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        animateCounter(e.target);
                        cio.unobserve(e.target);
                    }
                }),
            { threshold: 0.5 }
        );
        counters.forEach((el) => cio.observe(el));
    }

    function animateCounter(el) {
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const suffix = el.dataset.suffix || '';
        const isPlain = el.dataset.plain === '1';
        const duration = 1800;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = eased * target;

            if (isPlain) el.textContent = Math.round(current);
            else el.textContent = current.toFixed(decimals) + suffix;

            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    /* ══════════════════════════════════════════════════════════════
       3D TILT ON HOVER
       ══════════════════════════════════════════════════════════════ */
    if (window.matchMedia('(pointer: fine)').matches) {
        const tiltEls = $$('.card, .stat, .hero__stat, .coach, .plan, .quote');
        tiltEls.forEach((el) => {
            el.classList.add('tilt-3d');
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                const rotX = ((y - r.height / 2) / (r.height / 2)) * -5;
                const rotY = ((x - r.width / 2) / (r.width / 2)) * 5;
                el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px) translateY(-3px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    /* ══════════════════════════════════════════════════════════════
       HERO PARALLAX
       ══════════════════════════════════════════════════════════════ */
    const heroImg = $('.hero__media img');
    if (heroImg && window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener(
            'scroll',
            () => {
                const y = window.scrollY;
                if (y < window.innerHeight * 1.5) {
                    heroImg.style.transform = `scale(${1.05 + y * 0.00005}) translateY(${y * 0.15}px)`;
                }
            },
            { passive: true }
        );
    }

    /* ══════════════════════════════════════════════════════════════
       HERO GLOW CURSOR
       ══════════════════════════════════════════════════════════════ */
    const hero = $('.hero');
    if (hero && window.matchMedia('(pointer: fine)').matches) {
        const glow = document.createElement('div');
        glow.style.cssText = `position:absolute;width:400px;height:400px;border-radius:50%;
      background:radial-gradient(circle,rgba(255,97,5,.06),transparent 70%);
      pointer-events:none;z-index:1;transition:transform .3s ease-out,opacity .3s;
      opacity:0;transform:translate(-50%,-50%)`;
        hero.style.position = 'relative';
        hero.appendChild(glow);
        hero.addEventListener('mousemove', (e) => {
            const r = hero.getBoundingClientRect();
            glow.style.left = e.clientX - r.left + 'px';
            glow.style.top = e.clientY - r.top + 'px';
            glow.style.opacity = '1';
        });
        hero.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
        });
    }

    /* ══════════════════════════════════════════════════════════════
       SMOOTH ANCHORS
       ══════════════════════════════════════════════════════════════ */
    $$('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
            const t = $(a.getAttribute('href'));
            if (t) {
                e.preventDefault();
                t.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ══════════════════════════════════════════════════════════════
       TESTIMONIAL CAROUSEL
       ══════════════════════════════════════════════════════════════ */
    const track = $('#carousel-track');
    const prevBtn = $('#carousel-prev');
    const nextBtn = $('#carousel-next');
    const dotsWrap = $('#carousel-dots');
    const pauseBtn = $('#carousel-pause');

    if (track && prevBtn && nextBtn && dotsWrap) {
        const slides = $$('.carousel__slide', track);
        let currentPage = 0;
        let autoInterval = null;
        let isPaused = false;

        function getPerPage() {
            if (window.innerWidth >= 769) return 3;
            if (window.innerWidth >= 481) return 2;
            return 1;
        }

        function getTotalPages() {
            return Math.ceil(slides.length / getPerPage());
        }

        function buildDots() {
            dotsWrap.innerHTML = '';
            const total = getTotalPages();
            for (let i = 0; i < total; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel__dot' + (i === currentPage ? ' carousel__dot--active' : '');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', `Go to page ${i + 1}`);
                dot.setAttribute('aria-selected', String(i === currentPage));
                dot.addEventListener('click', () => goTo(i));
                dotsWrap.appendChild(dot);
            }
        }

        function updateUI() {
            const total = getTotalPages();
            const perPage = getPerPage();
            const offset = currentPage * (100 / perPage) * perPage;
            track.style.transform = `translateX(-${offset}%)`;

            // update dots
            const dots = $$('.carousel__dot', dotsWrap);
            dots.forEach((d, i) => {
                d.classList.toggle('carousel__dot--active', i === currentPage);
                d.setAttribute('aria-selected', String(i === currentPage));
            });

            // update buttons
            prevBtn.disabled = currentPage === 0;
            nextBtn.disabled = currentPage >= total - 1;

            // Update aria
            slides.forEach((s, i) => {
                const pageStart = currentPage * perPage;
                const pageEnd = pageStart + perPage;
                const visible = i >= pageStart && i < pageEnd;
                s.setAttribute('aria-hidden', String(!visible));
            });
        }

        function goTo(page) {
            const total = getTotalPages();
            currentPage = Math.max(0, Math.min(page, total - 1));
            updateUI();
        }

        function next() {
            if (currentPage >= getTotalPages() - 1) goTo(0);
            else goTo(currentPage + 1);
        }

        function prev() {
            goTo(currentPage - 1);
        }

        prevBtn.addEventListener('click', () => {
            prev();
            resetAuto();
        });

        nextBtn.addEventListener('click', () => {
            next();
            resetAuto();
        });

        // Autoplay
        function startAuto() {
            stopAuto();
            autoInterval = setInterval(() => {
                if (!isPaused) next();
            }, 5000);
        }

        function stopAuto() {
            if (autoInterval) clearInterval(autoInterval);
        }

        function resetAuto() {
            if (!isPaused) startAuto();
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                isPaused = !isPaused;
                pauseBtn.classList.toggle('paused', isPaused);
                pauseBtn.setAttribute('aria-label', isPaused ? 'Resume auto-play' : 'Pause auto-play');
                if (isPaused) stopAuto();
                else startAuto();
            });
        }

        // Touch / swipe support
        let startX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) next();
                else prev();
                resetAuto();
            }
        });

        // Keyboard
        const carousel = track.closest('.carousel');
        if (carousel) {
            carousel.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') { prev(); resetAuto(); }
                if (e.key === 'ArrowRight') { next(); resetAuto(); }
            });
        }

        // Recalculate on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (currentPage >= getTotalPages()) currentPage = getTotalPages() - 1;
                buildDots();
                updateUI();
            }, 150);
        });

        // Init
        buildDots();
        updateUI();
        startAuto();

        // Pause on hover (desktop)
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAuto);
            carousel.addEventListener('mouseleave', () => { if (!isPaused) startAuto(); });
        }
    }

    /* ══════════════════════════════════════════════════════════════
       STEP INTERACTION
       ══════════════════════════════════════════════════════════════ */
    const steps = $$('.step');
    steps.forEach((step) => {
        step.addEventListener('mouseenter', () => {
            steps.forEach((s) => {
                s.classList.remove('step--active');
                const badge = $('.step__badge', s);
                if (badge) badge.classList.add('step__badge--idle');
            });
            step.classList.add('step--active');
            const activeBadge = $('.step__badge', step);
            if (activeBadge) activeBadge.classList.remove('step__badge--idle');
        });
    });

    /* ══════════════════════════════════════════════════════════════
       MAGNETIC BUTTONS
       ══════════════════════════════════════════════════════════════ */
    if (window.matchMedia('(pointer: fine)').matches) {
        $$('.btn--hero').forEach((btn) => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                btn.style.transform = `perspective(400px) translateX(${x * 0.12}px) translateY(${y * 0.12}px) translateZ(8px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    /* ══════════════════════════════════════════════════════════════
       FORM HANDLING
       ══════════════════════════════════════════════════════════════ */
    // const form = $('#join-form');
    // const formOk = $('#form-ok');

    // if (form) {
    //     form.addEventListener('submit', (e) => {
    //         e.preventDefault();
    //         const btn = $('#join-submit');
    //         const orig = btn.innerHTML;
    //         btn.innerHTML = 'Sending…';
    //         btn.disabled = true;

    //         setTimeout(() => {
    //             form.reset();
    //             formOk.hidden = false;
    //             btn.innerHTML = orig;
    //             btn.disabled = false;
    //             formOk.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //             setTimeout(() => { formOk.hidden = true; }, 8000);
    //         }, 1200);
    //     });
    // }
    /* ---- Join form --------------------------------------------- */
    var form = document.getElementById('join-form');
    var ok = document.getElementById('form-ok');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var name = form.querySelector('#f-name');
            var phone = form.querySelector('#f-phone');

            [name, phone].forEach(function (input) {
                if (!input) return;
                var bad = !input.value.trim();
                input.style.borderColor = bad ? 'var(--color-amp-orange)' : '';
                input.setAttribute('aria-invalid', bad ? 'true' : 'false');
            });

            if (!name.value.trim() || !phone.value.trim()) {
                (name.value.trim() ? phone : name).focus();
                return;
            }

            var submit = document.getElementById('join-submit');
            var submitLabel = submit ? submit.innerHTML : '';
            if (submit) {
                submit.disabled = true;
                submit.style.opacity = '.65';
                submit.textContent = 'Sending\u2026';
            }

            // No backend: hand off to the front desk over WhatsApp.
            var message =
                'Hi Evaactivelife, I would like to claim my 2 free weeks.%0A%0A' +
                'Name: ' + encodeURIComponent(name.value.trim()) + '%0A' +
                'Phone: ' + encodeURIComponent(phone.value.trim()) + '%0A' +
                'Goal: ' + encodeURIComponent(form.goal ? form.goal.value : '') + '%0A' +
                'Preferred time: ' + encodeURIComponent(form.time ? form.time.value : '');

            window.setTimeout(function () {
                if (ok) ok.hidden = false;
                form.reset();
                if (submit) {
                    submit.disabled = false;
                    submit.style.opacity = '';
                    submit.innerHTML = submitLabel;
                }
                window.open('https://wa.me/2349133074078?text=' + message, '_blank', 'noopener');
            }, 420);
        });
    }

    /* ══════════════════════════════════════════════════════════════
       FOOTER YEAR
       ══════════════════════════════════════════════════════════════ */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ══════════════════════════════════════════════════════════════
       BRANCH LOCATIONS & DIRECTION MAP HANDLERS
       ══════════════════════════════════════════════════════════════ */
    const branchData = {
        ipaja: {
            title: 'Ipaja Branch',
            badgeText: 'Showing Ipaja Branch',
            address: '30 Fatade Road, Baruwa, Ipaja, Lagos, Nigeria',
            embedUrl: 'https://maps.google.com/maps?q=30%20Fatade%20Road%2C%20Baruwa%2C%20Ipaja%2C%20Lagos&t=&z=15&ie=UTF8&iwloc=&output=embed',
            dirUrl: 'https://www.google.com/maps/dir/?api=1&destination=30+Fatade+Road+Baruwa+Ipaja+Lagos',
            searchUrl: 'https://www.google.com/maps/search/?api=1&query=30+Fatade+Road+Baruwa+Ipaja+Lagos'
        },
        alagbado: {
            title: 'Alagbado Branch',
            badgeText: 'Showing Alagbado Branch',
            address: '104B Ayedun Bus Stop, AIT Road, Alagbado, Lagos, Nigeria',
            embedUrl: 'https://maps.google.com/maps?q=104B%20Ayedun%20Bus%20Stop%2C%20AIT%20Road%2C%20Alagbado%2C%20Lagos&t=&z=15&ie=UTF8&iwloc=&output=embed',
            dirUrl: 'https://www.google.com/maps/dir/?api=1&destination=104B+Ayedun+Bus+Stop+AIT+Road+Alagbado+Lagos',
            searchUrl: 'https://www.google.com/maps/search/?api=1&query=104B+Ayedun+Bus+Stop+AIT+Road+Alagbado+Lagos'
        }
    };

    let activeBranchKey = 'ipaja';

    const locationTabs = $$('.location-tab');
    const branchMapIframe = $('#branch-map-iframe');
    const mapBadgeText = $('#map-badge-text');
    const externalMapLink = $('#external-map-link');

    function switchBranch(key) {
        if (!branchData[key]) return;
        activeBranchKey = key;
        const data = branchData[key];

        // Update tabs state
        locationTabs.forEach(tab => {
            const isTarget = tab.getAttribute('data-branch') === key;
            tab.classList.toggle('active', isTarget);
            tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        });

        // Toggle branch details cards
        $$('.branch-details').forEach(card => {
            const isMatch = card.getAttribute('data-branch-content') === key;
            card.hidden = !isMatch;
            card.classList.toggle('active', isMatch);
        });

        // Update iframe map and links
        if (branchMapIframe) branchMapIframe.src = data.embedUrl;
        if (mapBadgeText) mapBadgeText.textContent = data.badgeText;
        if (externalMapLink) externalMapLink.href = data.searchUrl;
    }

    locationTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const branchKey = tab.getAttribute('data-branch');
            switchBranch(branchKey);
        });
    });

    // Copy Address Toast Handler
    function showCopyToast(text) {
        let toast = $('.copy-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'copy-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    $$('.copy-addr-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const addr = btn.getAttribute('data-address');
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(addr).then(() => {
                    showCopyToast('✓ Address copied to clipboard!');
                }).catch(() => {
                    showCopyToast('Address: ' + addr);
                });
            } else {
                showCopyToast('Address: ' + addr);
            }
        });
    });

    // Geolocation Handler
    const geoBtn = $('#geo-btn');
    const routeStartInput = $('#route-start');

    if (geoBtn && routeStartInput) {
        geoBtn.addEventListener('click', () => {
            if (!('geolocation' in navigator)) {
                showCopyToast('Geolocation is not supported by your browser.');
                return;
            }
            geoBtn.disabled = true;
            geoBtn.style.opacity = '.5';
            routeStartInput.placeholder = 'Locating you…';

            navigator.geolocation.getCurrentPosition(
                pos => {
                    geoBtn.disabled = false;
                    geoBtn.style.opacity = '';
                    const coords = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
                    routeStartInput.value = coords;
                    showCopyToast('✓ Location retrieved!');
                },
                err => {
                    geoBtn.disabled = false;
                    geoBtn.style.opacity = '';
                    routeStartInput.placeholder = 'e.g. Egbeda, Command, or Ikeja';
                    showCopyToast('Could not fetch location. Please enter area name.');
                },
                { timeout: 8000 }
            );
        });
    }

    // Driving Route Form Submission Handler
    const routeForm = $('#route-planner-form');
    if (routeForm) {
        routeForm.addEventListener('submit', e => {
            e.preventDefault();
            const startVal = routeStartInput ? routeStartInput.value.trim() : '';
            const targetData = branchData[activeBranchKey];
            let navUrl = targetData.dirUrl;

            if (startVal) {
                navUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startVal)}&destination=${encodeURIComponent(targetData.address)}&travelmode=driving`;
            }

            window.open(navUrl, '_blank', 'noopener');
        });
    }

})();