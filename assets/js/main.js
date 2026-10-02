/* Struttura90 — script (vanilla, nessuna libreria) */
(function () {
  'use strict';
  var WA = '393402664428';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- intro: solo alla prima visita della sessione ---------- */
  var intro = $('#intro');
  if (intro) {
    var seen = false;
    try { seen = sessionStorage.getItem('s90_intro') === '1'; sessionStorage.setItem('s90_intro', '1'); } catch (e) {}
    if (!seen && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      intro.classList.add('intro-screen-visible');
      setTimeout(function () { intro.classList.remove('intro-screen-visible'); }, 2100);
    }
  }

  /* ---------- menu mobile ---------- */
  var btn = $('#menu-btn'), menu = $('#menu-mobile');
  if (btn && menu) {
    var setMenu = function (open) {
      menu.classList.toggle('hidden', !open);
      btn.setAttribute('aria-expanded', open);
      btn.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
      $('.ico-open', btn).classList.toggle('hidden', open);
      $('.ico-close', btn).classList.toggle('hidden', !open);
    };
    btn.addEventListener('click', function () { setMenu(menu.classList.contains('hidden')); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* ---------- link WhatsApp (con provenienza campagna, utile per Meta/Google Ads) ---------- */
  var q = new URLSearchParams(location.search), src = {};
  ['utm_source', 'utm_campaign', 'fbclid', 'gclid'].forEach(function (k) {
    var v = q.get(k);
    try { if (v) sessionStorage.setItem(k, v); v = v || sessionStorage.getItem(k); } catch (e) {}
    if (v) src[k] = v;
  });
  var camp = src.utm_campaign || (src.fbclid ? 'meta' : src.gclid ? 'google' : '');
  var rif = camp ? '\n\n[rif. ' + (src.utm_source ? src.utm_source + ' / ' : '') + camp + ']' : '';
  $$('[data-wa]').forEach(function (a) {
    a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(a.getAttribute('data-wa') + rif);
    a.target = '_blank'; a.rel = 'noopener';
  });

  /* ---------- anno nel footer ---------- */
  $$('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- video dal cantiere (sezione Lavori realizzati) ---------- */
  var lv = $('#lv-video'), modal = $('#vmodal');
  if (lv && modal) {
    var v = $('.lv-vid', lv), mv = $('#vm-video'), snd = $('#lv-sound'), full = $('#lv-full'), lastFocus;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var safePlay = function (el) { var pr = el.play(); if (pr && pr.catch) pr.catch(function () {}); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { lv.classList.add('in'); if (!reduceMotion) safePlay(v); } else v.pause(); }); }, { threshold: 0.25 }).observe(lv);
    } else { lv.classList.add('in'); }
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    v.addEventListener('timeupdate', function () {
      $('#lv-t').textContent = '00:' + pad(Math.floor(v.currentTime));
      if (v.duration) $('#lv-p').style.width = (v.currentTime / v.duration * 100) + '%';
    });
    snd.addEventListener('click', function () {
      v.muted = !v.muted; if (!v.muted) safePlay(v);
      snd.setAttribute('aria-pressed', !v.muted);
      snd.setAttribute('aria-label', v.muted ? 'Attiva l’audio' : 'Disattiva l’audio');
      $('.i-off', snd).classList.toggle('hidden', !v.muted); $('.i-on', snd).classList.toggle('hidden', v.muted);
    });
    var openV = function () {
      lastFocus = document.activeElement; v.pause();
      modal.classList.add('open'); document.body.style.overflow = 'hidden';
      mv.currentTime = v.currentTime || 0; mv.muted = false; safePlay(mv);
      $('.vm-x', modal).focus();
    };
    var closeV = function () {
      mv.pause(); modal.classList.remove('open'); document.body.style.overflow = '';
      if (!reduceMotion) safePlay(v); if (lastFocus) lastFocus.focus();
    };
    full.addEventListener('click', openV);
    v.addEventListener('click', openV);
    $('.vm-x', modal).addEventListener('click', closeV);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeV(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeV(); });
  }

  /* ---------- ingresso pagina (dopo l'intro) ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var introOn = intro && intro.classList.contains('intro-screen-visible');
  setTimeout(function () { document.documentElement.classList.add('is-ready'); }, introOn ? 1500 : 60);

  /* ---------- comparsa allo scroll ---------- */
  var targets = [];
  $$('main section h2, main section .eyebrow, main section h3, main section article, main section p.max-w-sm, main section p.max-w-md, main section p.max-w-lg, main section ul, main section .grid > div > div.border, footer h2, footer .grid > div').forEach(function (el) {
    if (el.closest('.hz') || el.closest('.steps-rail') || el.closest('#top') || el.closest('.ticker')) return;
    el.classList.add('rv'); targets.push(el);
  });
  $$('main section article').forEach(function (el, i) { el.style.setProperty('--d', i % 3); });
  $$('.proj-frame').forEach(function (el) { targets.push(el); });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else { targets.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- chi siamo: la rotella in giù fa scorrere i pannelli verso destra ---------- */
  var hz = $('#processo'), track = $('#hz-track'), panels = $$('.hz-panel'), hzN = $('#hz-n'), hzBar = $('#hz-bar'), hzHint = $('.hz-hint'), hzCur = 0;
  function horizontal() {
    if (!hz || reduce) return;
    var r = hz.getBoundingClientRect(), vh = window.innerHeight, w = track.parentElement.clientWidth;
    var tot = r.height - vh, p = Math.min(1, Math.max(0, -r.top / tot)), n = panels.length;
    /* breve pausa su ogni pannello: il movimento avviene tra una pausa e l'altra */
    var seg = p * (n - 1), base = Math.floor(seg), f = seg - base;
    var hold = 0.28, t = f < hold ? 0 : f > 1 - hold ? 1 : (f - hold) / (1 - 2 * hold);
    var eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    var x = Math.min(n - 1, base + eased);
    track.style.transform = 'translate3d(' + (-x * w).toFixed(1) + 'px,0,0)';
    panels.forEach(function (pn, k) {
      var num = $('.hz-num', pn); if (num) num.style.transform = 'translate3d(' + ((k - x) * w * 0.35).toFixed(1) + 'px,0,0)';
    });
    var idx = Math.round(x);
    if (idx !== hzCur) { hzCur = idx; panels.forEach(function (pn, k) { pn.classList.toggle('act', k === idx); }); hzN.textContent = '0' + (idx + 1); }
    hzBar.style.width = (p * 100) + '%';
    if (hzHint) hzHint.innerHTML = p > 0.98 ? 'Continua <span class="hz-arrow">↓</span>' : 'Scorri <span class="hz-arrow">→</span>';
  }

  /* ---------- parallasse leggera sulle immagini ---------- */
  var par = $$('[data-parallax]');
  function parallax() {
    if (reduce) return;
    var vh = window.innerHeight;
    par.forEach(function (el) {
      var box = el.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) return;
      var k = parseFloat(el.getAttribute('data-parallax'));
      var off = (box.top + box.height / 2 - vh / 2) * -k;
      el.style.translate = '0 ' + off.toFixed(1) + 'px';
    });
  }

  /* ---------- testata che ricompare risalendo ---------- */
  var head = $('#site-head'), lastY = window.scrollY, menuMob = $('#menu-mobile');
  function header() {
    if (!head) return;
    var y = window.scrollY, past = y > 600;
    head.classList.toggle('is-fixed', past);
    if (past) head.classList.toggle('is-shown', y < lastY - 2 || (menuMob && !menuMob.classList.contains('hidden')));
    else head.classList.remove('is-shown');
    if (Math.abs(y - lastY) > 2) lastY = y;
  }

  /* rete di sicurezza: nessun elemento resta invisibile anche con uno scroll molto veloce */
  function revealPassed() {
    var vh = window.innerHeight;
    for (var i = targets.length - 1; i >= 0; i--) {
      var el = targets[i];
      if (el.classList.contains('in')) { targets.splice(i, 1); continue; }
      if (el.getBoundingClientRect().top < vh * 0.92) { el.classList.add('in'); targets.splice(i, 1); }
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { header(); revealPassed(); horizontal(); parallax(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- lightbox pagina progetti ---------- */
  var lb = $('#lb');
  if (lb) {
    var items = $$('.js-lb'), pos = 0, last;
    var show = function () {
      var it = items[pos];
      $('#lb-img').src = it.getAttribute('data-img');
      $('#lb-img').alt = it.getAttribute('data-cap');
      $('#lb-cap').textContent = it.getAttribute('data-cap') + '  ·  ' + (pos + 1) + ' / ' + items.length;
    };
    var open = function (i) { pos = i; last = document.activeElement; show(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('.lb-x', lb).focus(); };
    var close = function () { lb.classList.remove('open'); document.body.style.overflow = ''; if (last) last.focus(); };
    var step = function (d) { pos = (pos + d + items.length) % items.length; show(); };
    items.forEach(function (it, i) { it.addEventListener('click', function () { open(i); }); });
    $('.lb-x', lb).onclick = close; $('.lb-p', lb).onclick = function () { step(-1); }; $('.lb-n', lb).onclick = function () { step(1); };
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1);
    });
    var tx = 0;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { var d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) step(d < 0 ? 1 : -1); });
  }
})();
