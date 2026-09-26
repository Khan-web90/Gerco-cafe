/* =========================================================
   GRECA COFFEE N PASTRY — Interactions
   - Lenis smooth scroll
   - Custom cursor with magnetic effects
   - GSAP scroll reveals & parallax
   - Mobile menu
   - Magnetic buttons
   ========================================================= */

(function () {
    'use strict';

    // =========================================================
    // Wait for DOM + scripts (GSAP, ScrollTrigger, Lenis)
    // =========================================================
    const ready = (fn) => {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    };

    ready(() => {
        // Wait a tick for deferred scripts (GSAP, Lenis)
        const waitLibs = (tries = 0) => {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof Lenis !== 'undefined') {
                init();
            } else if (tries < 80) {
                setTimeout(() => waitLibs(tries + 1), 50);
            } else {
                // Fallback without libs
                initFallback();
            }
        };
        waitLibs();
    });

    // =========================================================
    // MAIN INIT
    // =========================================================
    function init() {
        gsap.registerPlugin(ScrollTrigger);
        initPreloader();
        initLenis();
        initCursor();
        initMagneticButtons();
        initMobileMenu();
        initNavigation();
        initScrollReveals();
        initParallax();
        initActiveLink();
    }

    // =========================================================
    // FALLBACK (no GSAP/Lenis)
    // =========================================================
    function initFallback() {
        initPreloader();
        initCursor();
        initMagneticButtons();
        initMobileMenu();
        initNavigation();
        // Reveal on scroll via IntersectionObserver
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('.reveal-up, .line-mask').forEach((el) => io.observe(el));
        initActiveLink();
    }

    // =========================================================
    // PRELOADER — fast, fail-safe reveal
    // =========================================================
    function initPreloader() {
        const el = document.getElementById('preloader');
        if (!el) return;

        // Lock scroll until revealed
        document.body.style.overflow = 'hidden';

        let revealed = false;
        function reveal() {
            if (revealed) return;
            revealed = true;
            try {
                el.classList.add('is-done');
                document.body.style.overflow = '';
                window.dispatchEvent(new Event('preloaderDone'));
            } catch (e) {
                el.style.display = 'none';
                document.body.style.overflow = '';
            }
        }

        // Reveal as soon as the HTML is parsed (don't wait for images/video).
        // Hero image will appear via background-image which the browser fetches
        // lazily; the site is interactive immediately.
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(reveal, 700);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(reveal, 700);
            });
        }

        // Hard safety fallback — never leave the loader stuck
        setTimeout(reveal, 2200);

        // Failsafe: if window load never fires (e.g. blocking asset), force reveal
        window.addEventListener('load', () => {
            setTimeout(reveal, 600);
        });
    }

    // =========================================================
    // LENIS SMOOTH SCROLL
    // =========================================================
    function initLenis() {
        const lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false,
        });

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        // Anchor links
        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const href = a.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                lenis.scrollTo(target, { offset: -40, duration: 1.6 });
            });
        });
    }

    // =========================================================
    // CUSTOM CURSOR
    // =========================================================
    function initCursor() {
        if (window.matchMedia('(max-width: 1024px)').matches) return;

        const cursor = document.getElementById('cursor');
        const cursorText = document.getElementById('cursorText');
        if (!cursor) return;

        const dot = cursor.querySelector('.cursor-dot');
        const ring = cursor.querySelector('.cursor-ring');

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let dotX = mouseX, dotY = mouseY;
        let ringX = mouseX, ringY = mouseY;
        let textX = mouseX, textY = mouseY;

        const DOT_LERP = 0.95;
        const RING_LERP = 0.18;
        const TEXT_LERP = 0.16;

        function animate() {
            dotX += (mouseX - dotX) * DOT_LERP;
            dotY += (mouseY - dotY) * DOT_LERP;
            ringX += (mouseX - ringX) * RING_LERP;
            ringY += (mouseY - ringY) * RING_LERP;
            textX += (mouseX - textX) * TEXT_LERP;
            textY += (mouseY - textY) * TEXT_LERP;

            dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
            ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            cursorText.style.transform = `translate(${textX}px, ${textY}px) translate(-50%, -50%) scale(${cursor.classList.contains('is-cta') || cursor.classList.contains('is-view') ? 1 : 0})`;

            requestAnimationFrame(animate);
        }
        animate();

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
        window.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
        });

        // Hover states
        const interactive = document.querySelectorAll('a, button, .btn, .menu-card, .gal, .exp-img, input, textarea, select');
        interactive.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('is-link');
                cursor.classList.remove('is-cta', 'is-view');
                cursorText.textContent = '';
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('is-link', 'is-cta', 'is-view');
                cursorText.textContent = '';
            });
        });

        // CTA hover with text
        document.querySelectorAll('[data-cursor="cta"]').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.remove('is-link', 'is-view');
                cursor.classList.add('is-cta');
                cursorText.textContent = '';
            });
        });

        // VIEW hover (images)
        document.querySelectorAll('[data-cursor="view"]').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.remove('is-link', 'is-cta');
                cursor.classList.add('is-view');
                cursorText.textContent = 'VIEW';
            });
        });
    }

    // =========================================================
    // MAGNETIC BUTTONS
    // =========================================================
    function initMagneticButtons() {
        if (window.matchMedia('(max-width: 1024px)').matches) return;

        const buttons = document.querySelectorAll('.magnetic, .btn, .nav-cta');
        buttons.forEach((btn) => {
            let bounds = btn.getBoundingClientRect();
            const strength = 0.35;
            const radius = 100;

            function updateBounds() {
                bounds = btn.getBoundingClientRect();
            }
            window.addEventListener('resize', updateBounds);
            window.addEventListener('scroll', updateBounds, { passive: true });

            btn.addEventListener('mousemove', (e) => {
                const x = e.clientX;
                const y = e.clientY;
                const cx = bounds.left + bounds.width / 2;
                const cy = bounds.top + bounds.height / 2;
                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.hypot(dx, dy);

                if (dist < radius) {
                    const moveX = dx * strength;
                    const moveY = dy * strength;
                    btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
                }
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // =========================================================
    // MOBILE MENU
    // =========================================================
    function initMobileMenu() {
        const burger = document.getElementById('burger');
        const menu = document.getElementById('mobileMenu');
        if (!burger || !menu) return;

        const links = menu.querySelectorAll('.mm-link, .mm-cta');

        function open() {
            burger.classList.add('is-active');
            menu.classList.add('is-open');
            menu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
        function close() {
            burger.classList.remove('is-active');
            menu.classList.remove('is-open');
            menu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        burger.addEventListener('click', () => {
            if (menu.classList.contains('is-open')) close();
            else open();
        });

        links.forEach((l) => {
            l.addEventListener('click', () => {
                close();
            });
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
        });
    }

    // =========================================================
    // NAV SCROLL STATE
    // =========================================================
    function initNavigation() {
        const nav = document.getElementById('nav');
        if (!nav) return;

        function onScroll() {
            if (window.scrollY > 60) nav.classList.add('is-scrolled');
            else nav.classList.remove('is-scrolled');
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // =========================================================
    // ACTIVE NAV LINK ON SCROLL
    // =========================================================
    function initActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const links = document.querySelectorAll('.nav-link');
        if (!sections.length || !links.length) return;

        function update() {
            const scrollY = window.scrollY + window.innerHeight / 3;
            let currentId = '';
            sections.forEach((s) => {
                if (s.offsetTop <= scrollY) currentId = s.id;
            });
            links.forEach((l) => {
                l.classList.remove('active');
                const href = l.getAttribute('href');
                if (href === `#${currentId}`) l.classList.add('active');
            });
        }
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    // =========================================================
    // SCROLL REVEALS — GSAP powered
    // =========================================================
    function initScrollReveals() {
        // reveal-up
        gsap.utils.toArray('.reveal-up').forEach((el) => {
            const delay = parseFloat(el.dataset.delay) || 0;
            gsap.fromTo(el,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power3.out',
                    delay,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        once: true,
                    },
                }
            );
        });

        // line-mask
        gsap.utils.toArray('.line-mask').forEach((el) => {
            const spans = el.querySelectorAll(':scope > span');
            gsap.to(spans, {
                y: 0,
                duration: 1.3,
                ease: 'power3.out',
                stagger: 0.12,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true,
                },
            });
        });
    }

    // =========================================================
    // PARALLAX (data-parallax="0.18")
    // =========================================================
    function initParallax() {
        gsap.utils.toArray('[data-parallax]').forEach((el) => {
            const speed = parseFloat(el.dataset.parallax) || 0.15;
            gsap.fromTo(el,
                { yPercent: -speed * 60 },
                {
                    yPercent: speed * 60,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                }
            );
        });
    }
})();
