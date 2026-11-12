/* Поведение страницы: фото на прокрутке, появление блоков, счётчики, увеличение фото, отзывы, форма, панель на телефоне. */
(function () {
  var TEL = '<a href="tel:+79066293988">+7 (906) 629-39-88</a> или напишите в <a href="https://vk.ru/sonata.lavstu" target="_blank" rel="noopener">ВКонтакте</a>';
  var FORM_ENDPOINT = ''; /* {{адрес приёма заявок}} */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id) { return document.getElementById(id); }
  var hero = $('hero'), bar = $('bar'), visit = $('visit');
  var hv = document.querySelector('.hero-v'), band = document.querySelector('.band-box');

  function update() {
    var H = innerHeight, hr = hero.getBoundingClientRect(), cr = visit.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, -hr.top / Math.max(1, hr.height)));
    if (!reduce && hv) hv.style.setProperty('--py', p.toFixed(3));
    if (!reduce && band) {
      var br = band.getBoundingClientRect();
      if (br.bottom > 0 && br.top < H) band.style.setProperty('--py', ((H - br.top) / (H + br.height) - .5).toFixed(3));
    }
    bar.classList.toggle('on', hr.bottom < H * .4 && cr.top > H * .5);
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); } }, { passive: true });
  addEventListener('resize', update);
  update();

  /* буквы-аватарки у отзывов */
  document.querySelectorAll('.rev footer b').forEach(function (b) {
    var s = document.createElement('i'); s.className = 'av'; s.setAttribute('aria-hidden', 'true');
    s.textContent = (b.textContent.trim()[0] || '•').toUpperCase(); b.parentNode.insertBefore(s, b);
  });

  /* счётчики */
  function count(el) {
    var dec = el.hasAttribute('data-count'), to = parseFloat(el.getAttribute(dec ? 'data-count' : 'data-num')), t0 = performance.now();
    (function f(now) {
      var k = Math.min(1, (now - t0) / 1300), e = 1 - Math.pow(1 - k, 3), v = to * e;
      el.textContent = dec ? v.toFixed(1).replace('.', ',') : String(Math.round(v));
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var rise = document.querySelectorAll('.sec .head>*,.rhead>*,.card,.pl li,.price-r,.rev-g:not(.rev-more) .rev,.vcard,.stats-g div,.pull blockquote,.band-t>*');
    var rv = document.querySelectorAll('.wk,.place figure,.why-ph,.price-ph,.pull-ph');
    rise.forEach(function (el) { el.classList.add('rise'); });
    rv.forEach(function (el) { el.classList.add('rv'); });
    var seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
        el.style.transitionDelay = Math.min(sib, 6) * 70 + 'ms';
        el.classList.add('in'); seen.unobserve(el);
        el.querySelectorAll('[data-count],[data-num]').forEach(count);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rise.forEach(function (el) { seen.observe(el); });
    rv.forEach(function (el) { seen.observe(el); });
  }

  /* увеличение фото работ */
  var lb = $('lb'), lbImg = $('lbImg'), lbCap = $('lbCap');
  function openLb(fig) {
    var im = fig.querySelector('img'), cap = fig.querySelector('figcaption');
    lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt; lbCap.textContent = cap ? cap.textContent : '';
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
  }
  document.querySelectorAll('[data-zoom]').forEach(function (f) {
    f.addEventListener('click', function () { openLb(f); });
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(f); } });
  });
  if (lb) {
    $('lbX').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  var more = $('revMore'), btn = $('revBtn');
  if (btn) btn.addEventListener('click', function () {
    var o = more.classList.toggle('open');
    btn.setAttribute('aria-expanded', o);
    btn.textContent = o ? 'Свернуть отзывы' : 'Показать ещё отзывы';
  });

  var form = $('form'), msg = $('formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ph = form.elements.phone, ok = ph.value.replace(/\D/g, '').length >= 10;
    ph.classList.toggle('invalid', !ok);
    if (!ok) { msg.textContent = 'Укажите телефон, чтобы мы могли перезвонить.'; ph.focus(); return; }
    if (!FORM_ENDPOINT) { msg.innerHTML = 'Заявки с сайта пока не подключены, поэтому ваш номер не отправлен. Позвоните: ' + TEL; return; }
    fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form) })
      .then(function (r) { if (!r.ok) throw 0; msg.textContent = 'Заявка принята, перезвоним.'; form.reset(); })
      .catch(function () { msg.innerHTML = 'Заявка не отправилась. Позвоните: ' + TEL; });
  });
})();
