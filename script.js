/* ============================================================
   Evaactivelife Gym — interactions
   ============================================================ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Sticky nav hairline ---------------------------------- */
  var nav = document.getElementById('nav');

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('is-stuck', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile menu ------------------------------------------ */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('mobile-menu');

  function closeMenu() {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    menu.classList.remove('is-open');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      menu.classList.toggle('is-open', !open);
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024) closeMenu();
    });
  }

  /* ---- Scroll reveal ---------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el, i) {
      // Stagger cards inside the same grid.
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
      revealObserver.observe(el);
    });

    // Safety net: never leave content stranded invisible if the
    // observer never reports (background tabs, odd engines).
    window.addEventListener('load', function () {
      window.setTimeout(function () {
        reveals.forEach(function (el) {
          if (el.classList.contains('is-visible')) return;
          var box = el.getBoundingClientRect();
          if (box.top < window.innerHeight && box.bottom > 0) {
            el.classList.add('is-visible');
          }
        });
      }, 2500);
    });
  }

  /* ---- Number counters -------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');

  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var plain = el.hasAttribute('data-plain');
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1100;
    var start = null;

    function format(value) {
      var out = plain
        ? String(Math.round(value))
        : value.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
          });
      return out + suffix;
    }

    if (reduced) { el.textContent = format(target); return; }

    el.textContent = format(0);

    function frame(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = format(target);
    }
    requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCounter);
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          countObserver.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* ---- FAQ: keep one panel open at a time -------------------- */
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

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

  /* ---- Footer year ------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
