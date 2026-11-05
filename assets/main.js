/* Shared behaviour: theme toggle, watercolor sky, mini constellation nav, hero scroll, research-map hover. */
(function () {
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const saved = store.get('theme');
  if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PAGES = [
    { id: 'research', label: 'Research', href: 'research.html' },
    { id: 'experience', label: 'Experience', href: 'experience.html' },
    { id: 'education', label: 'Education', href: 'education.html' },
    { id: 'certificates', label: 'Certificates', href: 'certificates.html' }
  ];

  const SKY = '<div class="pool p1"></div><div class="pool p2"></div><div class="pool p3"></div><div class="pool p4"></div><div class="pool p5"></div><div class="pool p6"></div>' +
    '<svg class="grain" preserveAspectRatio="none" viewBox="0 0 1000 560" aria-hidden="true"><filter id="wc"><feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.25"/></filter><rect width="1000" height="560" filter="url(#wc)"/></svg>';
  document.querySelectorAll('.sky').forEach(el => { el.insertAdjacentHTML('afterbegin', SKY); });

  const BLOOM = '<defs><radialGradient id="bloom"><stop offset="0" style="stop-color:var(--star);stop-opacity:1"/><stop offset=".3" style="stop-color:var(--star);stop-opacity:.7"/><stop offset="1" style="stop-color:var(--star);stop-opacity:0"/></radialGradient></defs>';
  function starsSVG(points, opts) {
    const { current, size = 1, labelAbove = true } = opts || {};
    let s = '<polyline class="path" points="' + points.map(p => p.join(',')).join(' ') + '"/>';
    PAGES.forEach((pg, i) => {
      const [x, y] = points[i];
      const r = (i === 0 ? 34 : 30) * size, c = (i === 0 ? 3.4 : 3) * size, sp = r * .7;
      const last = i === PAGES.length - 1;
      const ty = labelAbove && !last ? y - 22 * size : y + 34 * size;
      s += '<a class="star' + (pg.id === current ? ' current' : '') + '" href="' + pg.href + '"' + (pg.id === current ? ' aria-current="page"' : '') + '>' +
        '<circle class="bloom" cx="' + x + '" cy="' + y + '" r="' + r + '"/>' +
        '<g class="spike"><line x1="' + x + '" y1="' + (y - sp) + '" x2="' + x + '" y2="' + (y + sp) + '"/><line x1="' + (x - sp) + '" y1="' + y + '" x2="' + (x + sp) + '" y2="' + y + '"/></g>' +
        '<circle class="core" cx="' + x + '" cy="' + y + '" r="' + c + '"/>' +
        '<text x="' + x + '" y="' + ty + '" text-anchor="middle">' + pg.label + '</text></a>';
    });
    return s;
  }

  // Home constellation
  const home = document.querySelector('.constellation svg');
  if (home) {
    const dust = [[420,110,1.2,.7],[610,80,1,.6],[760,140,1.4,.8],[905,215,1,.6],[715,365,1.2,.7],[945,430,1.4,.7],[495,300,1,.6],[350,220,1.2,.5],[580,420,1,.5],[840,470,1,.6],[980,120,1.2,.6],[300,420,1,.5]]
      .map(d => '<circle class="dust" cx="' + d[0] + '" cy="' + d[1] + '" r="' + d[2] + '" opacity="' + d[3] + '"/>').join('');
    const tw = [[452,239,7],[920,80,8],[640,446,6]].map(t => '<g class="twinkle"><line x1="' + t[0] + '" y1="' + (t[1]-t[2]) + '" x2="' + t[0] + '" y2="' + (t[1]+t[2]) + '"/><line x1="' + (t[0]-t[2]) + '" y1="' + t[1] + '" x2="' + (t[0]+t[2]) + '" y2="' + t[1] + '"/></g>').join('');
    home.innerHTML = BLOOM + dust + tw + starsSVG([[520,160],[668,196],[792,250],[872,340]]);
    // On narrow screens crop the view to the constellation so the stars and labels stay legible
    const fit = () => home.setAttribute('viewBox', innerWidth < 760 ? '440 40 520 420' : '0 0 1000 560');
    fit(); addEventListener('resize', fit);
  }

  // Mini nav on section pages
  const mini = document.querySelector('.mini-nav svg');
  if (mini) mini.innerHTML = BLOOM + starsSVG([[30,40],[150,62],[260,96],[340,150]], { current: mini.dataset.current, size: .62 });

  // Theme toggle
  const btn = document.querySelector('.theme-btn');
  if (btn) btn.addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    const next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next); store.set('theme', next);
  });

  // Hero: nuance bands widen with scroll; the name's ink edge recedes
  const bandsHost = document.querySelector('.bands');
  if (bandsHost) {
    const base = [];
    for (let w = 168; base.length < 110; w = Math.max(1, w * 0.86)) base.push(w);
    const els = base.map((w, k) => { const i = document.createElement('i'); if (k % 2 === 0) i.className = 'light'; bandsHost.appendChild(i); return i; });
    const track = document.querySelector('.hero-track'), name = document.querySelector('.name'), hint = document.querySelector('.scroll-hint');
    const wash = document.querySelector('.wash'), stars = document.querySelector('.constellation');
    const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const scale = () => Math.max(.5, Math.min(1.4, innerWidth / 1280));
    let ticking = false;
    function draw() {
      ticking = false;
      const span = track.offsetHeight - innerHeight;
      const p = reduce ? 0 : Math.min(1, Math.max(0, scrollY / span));
      const e = ease(p), k = scale();
      els.forEach((el, i) => {
        const light = i % 2 === 0;
        el.style.width = (base[i] * k * (light ? 1 + 5 * e : 1 - .7 * e)) + 'px';
        if (light) el.style.opacity = .22 + .7 * e;
      });
      if (name) name.style.backgroundPosition = (e * 100) + '% 0';
      if (hint) hint.style.opacity = .35 * (1 - e);
      // last stretch: the whole field settles into the white page, the constellation fades with it
      const settle = Math.max(0, (e - .55) / .45);
      if (wash) wash.style.opacity = .96 * settle;
      if (stars) stars.style.opacity = 1 - .85 * settle;
    }
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(draw); } };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    draw();
  }

  // News: one list in assets/news.js feeds the home strip (latest few) and the full archive
  if (Array.isArray(window.NEWS)) {
    const row = n => '<li><span class="gloss">' + n.label + '</span><span>' + n.text + '</span></li>';
    document.querySelectorAll('ul.news[data-limit]').forEach(ul => {
      ul.innerHTML = window.NEWS.slice(0, Number(ul.dataset.limit) || 4).map(row).join('');
    });
    const archive = document.querySelector('.news-archive');
    if (archive) {
      const years = [...new Set(window.NEWS.map(n => n.date.slice(0, 4)))];
      archive.innerHTML = years.map(y =>
        '<section class="section" aria-label="' + y + '"><header><span class="label">News</span><h2>' + y + '</h2></header>' +
        '<div class="body"><ul class="news">' + window.NEWS.filter(n => n.date.startsWith(y)).map(row).join('') + '</ul></div></section>'
      ).join('');
    }
  }

  // Email links copy the address instead of opening a mail app; if copying is blocked, mailto still works
  const toast = document.createElement('div');
  toast.className = 'toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  let toastTimer;
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
    a.addEventListener('click', async e => {
      const addr = a.getAttribute('href').slice(7);
      if (!navigator.clipboard) return;
      e.preventDefault();
      try { await navigator.clipboard.writeText(addr); }
      catch (err) { location.href = a.getAttribute('href'); return; }
      toast.textContent = 'Email copied: ' + addr;
      toast.classList.add('show');
      clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
    });
    a.setAttribute('title', 'Click to copy email address');
  });

  // Back-to-top: a small floating button that appears after the first screen
  const top = document.createElement('button');
  top.type = 'button'; top.className = 'to-top'; top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(top);
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  // Home: a twin floating button on every page except the home page itself
  const onHome = !!document.querySelector('.hero');
  let homeBtn = null;
  if (!onHome) {
    homeBtn = document.createElement('a');
    homeBtn.href = 'index.html'; homeBtn.className = 'to-top to-home'; homeBtn.setAttribute('aria-label', 'Home');
    homeBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7M6 9.5V20h4.5v-5.5h3V20H18V9.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(homeBtn);
  }
  const showTop = () => { const on = scrollY > innerHeight * 0.8; top.classList.toggle('show', on); if (homeBtn) homeBtn.classList.toggle('show', on); };
  addEventListener('scroll', showTop, { passive: true }); showTop();

  // Research map: hover a zone (or its legend) to bring it forward; click jumps to the section
  const rm = document.querySelector('.rm');
  if (rm) {
    const zones = [...rm.querySelectorAll('.zone')];
    const legend = [...document.querySelectorAll('.map-legend a')];
    const on = z => { rm.classList.add('focus'); zones.forEach(x => x.classList.toggle('on', x.dataset.z === z)); legend.forEach(a => a.classList.toggle('on', a.dataset.z === z)); };
    const off = () => { rm.classList.remove('focus'); zones.forEach(x => x.classList.remove('on')); legend.forEach(a => a.classList.remove('on')); };
    zones.forEach(z => {
      z.addEventListener('mouseenter', () => on(z.dataset.z));
      z.addEventListener('mouseleave', off);
      z.addEventListener('click', () => { const t = document.getElementById(z.dataset.z); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
    });
    legend.forEach(a => { a.addEventListener('mouseenter', () => on(a.dataset.z)); a.addEventListener('mouseleave', off); });
  }
})();
