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
    { id: 'certificates', label: 'Awards', href: 'certificates.html' }
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

  // Saturn in the sky, drawn as an outline: the CV download (home and every subpage header)
  function planetSVG(cx, cy, r, id) {
    const k = r / 13, rx = 2.05 * r, ry = 0.62 * r, w = 1.6 * k;
    const back = 'M' + (cx - rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + cy;
    const front = 'M' + (cx + rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx - rx) + ' ' + cy;
    return '<defs><mask id="' + id + '" maskUnits="userSpaceOnUse"><rect x="' + (cx - 3 * r) + '" y="' + (cy - 3 * r) + '" width="' + 6 * r + '" height="' + 6 * r + '" fill="#fff"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + w) + '" fill="#000"/></mask></defs>' +
      '<a class="star planet" href="cv/Kai_Park_CV_public.pdf" download="Kai_Park_CV.pdf" aria-label="Download CV (PDF)">' +
      '<circle class="bloom" cx="' + cx + '" cy="' + cy + '" r="' + 34 * k + '"/>' +
      '<g class="saturn" style="transform-origin:' + cx + 'px ' + cy + 'px;stroke-width:' + w + 'px">' +
      '<circle class="globe" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>' +
      '<g transform="rotate(-24 ' + cx + ' ' + cy + ')"><path class="ring" d="' + back + '" mask="url(#' + id + ')"/><path class="ring" d="' + front + '"/></g></g>' +
      '<text x="' + cx + '" y="' + (cy + 36 * k) + '" text-anchor="middle">CV ↓</text></a>';
  }

  // A comet beside the constellation: the latest talk (video, slides, links)
  function cometSVG(cx, cy, k, id, current) {
    const tx = cx - 36 * k, ty = cy - 20 * k;
    return '<defs><linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + tx + '" y1="' + ty + '" x2="' + cx + '" y2="' + cy + '">' +
      '<stop offset="0" style="stop-color:var(--star);stop-opacity:0"/><stop offset="1" style="stop-color:var(--star);stop-opacity:.95"/></linearGradient></defs>' +
      '<a class="star comet' + (current ? ' current' : '') + '" href="talk.html" aria-label="Talk: video, slides and links"' + (current ? ' aria-current="page"' : '') + '>' +
      '<circle class="bloom" cx="' + cx + '" cy="' + cy + '" r="' + 26 * k + '"/>' +
      '<g class="cbody" style="transform-origin:' + cx + 'px ' + cy + 'px">' +
      '<line class="tail" x1="' + tx + '" y1="' + ty + '" x2="' + cx + '" y2="' + cy + '" stroke="url(#' + id + ')" stroke-width="' + 2.4 * k + '"/>' +
      '<line class="tail" x1="' + (tx + 6 * k) + '" y1="' + (ty + 9 * k) + '" x2="' + cx + '" y2="' + cy + '" stroke="url(#' + id + ')" stroke-width="' + 1.2 * k + '" opacity=".7"/>' +
      '<circle class="core" cx="' + cx + '" cy="' + cy + '" r="' + 3.4 * k + '"/></g>' +
      '<text x="' + cx + '" y="' + (cy + 30 * k) + '" text-anchor="middle">Talk</text></a>';
  }

  // Home constellation
  const home = document.querySelector('.constellation svg');
  if (home) {
    const dust = [[420,110,1.2,.7],[610,80,1,.6],[760,140,1.4,.8],[905,215,1,.6],[715,365,1.2,.7],[945,430,1.4,.7],[495,300,1,.6],[350,220,1.2,.5],[580,420,1,.5],[840,470,1,.6],[980,120,1.2,.6],[300,420,1,.5]]
      .map(d => '<circle class="dust" cx="' + d[0] + '" cy="' + d[1] + '" r="' + d[2] + '" opacity="' + d[3] + '"/>').join('');
    const tw = [[452,239,7],[920,80,8],[640,446,6]].map(t => '<g class="twinkle"><line x1="' + t[0] + '" y1="' + (t[1]-t[2]) + '" x2="' + t[0] + '" y2="' + (t[1]+t[2]) + '"/><line x1="' + (t[0]-t[2]) + '" y1="' + t[1] + '" x2="' + (t[0]+t[2]) + '" y2="' + t[1] + '"/></g>').join('');
    home.innerHTML = BLOOM + dust + tw + starsSVG([[520,160],[668,196],[792,250],[872,340]]) + planetSVG(900, 100, 11, 'saturn-cut') + cometSVG(700, 92, 1, 'comet-tail');
    // On narrow screens crop the view to the constellation so the stars and labels stay legible
    const fit = () => home.setAttribute('viewBox', innerWidth < 760 ? '440 40 520 420' : '0 0 1000 560');
    fit(); addEventListener('resize', fit);
  }

  // Mini nav on section pages
  const mini = document.querySelector('.mini-nav svg');
  if (mini) mini.innerHTML = BLOOM + starsSVG([[30,40],[150,62],[260,96],[340,150]], { current: mini.dataset.current, size: .62 }) + planetSVG(368, 52, 7, 'saturn-cut-mini') + cometSVG(108, 142, .62, 'comet-tail-mini', mini.dataset.current === 'talk');

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

  // Email links copy the address instead of opening a mail app; if copying is blocked, mailto still works. The address is encoded in data-mail to keep simple spam bots out
  const toast = document.createElement('div');
  toast.className = 'toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  let toastTimer;
  document.querySelectorAll('a[data-mail]').forEach(a => {
    a.addEventListener('click', async e => {
      const addr = atob(a.dataset.mail);
      e.preventDefault();
      try { await navigator.clipboard.writeText(addr); }
      catch (err) { location.href = 'mailto:' + addr; return; }
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
  // Menu: a floating button beside back-to-top that opens a short list of every page
  const here = (location.pathname.split('/').pop() || 'index.html');
  const LINKS = [['index.html', 'Home'], ...PAGES.slice(0, 1).map(p => [p.href, p.label]), ['talk.html', 'Talk'], ...PAGES.slice(1).map(p => [p.href, p.label]), ['news.html', 'News']];
  const menuBtn = document.createElement('button');
  menuBtn.type = 'button'; menuBtn.className = 'to-top to-menu';
  menuBtn.setAttribute('aria-label', 'Menu'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-controls', 'fab-menu');
  menuBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const panel = document.createElement('nav');
  panel.id = 'fab-menu'; panel.className = 'menu-panel'; panel.setAttribute('aria-label', 'Pages'); panel.hidden = true;
  panel.innerHTML = '<ul>' + LINKS.map(([href, label]) =>
    '<li><a href="' + href + '"' + (href === here ? ' aria-current="page"' : '') + '>' + label + '</a></li>').join('') +
    '<li class="menu-cv"><a href="cv/Kai_Park_CV_public.pdf" download="Kai_Park_CV.pdf">Download CV ↓</a></li></ul>';
  document.body.appendChild(panel); document.body.appendChild(menuBtn);
  const setMenu = open => {
    panel.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open));
    if (open) { const first = panel.querySelector('a'); if (first) first.focus(); }
  };
  menuBtn.addEventListener('click', e => { e.stopPropagation(); setMenu(panel.hidden); });
  document.addEventListener('click', e => { if (!panel.hidden && !panel.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { setMenu(false); menuBtn.focus(); } });
  // Top menu: a familiar hamburger next to the home icon, opening the same list as a dropdown
  const mark = document.querySelector('.bar .mark');
  if (mark) {
    const wrap = document.createElement('span'); wrap.className = 'bar-left';
    mark.parentNode.insertBefore(wrap, mark); wrap.appendChild(mark);
    const tBtn = document.createElement('button');
    tBtn.type = 'button'; tBtn.className = 'top-menu-btn';
    tBtn.setAttribute('aria-label', 'Menu'); tBtn.setAttribute('aria-expanded', 'false'); tBtn.setAttribute('aria-controls', 'top-menu');
    tBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7h15M4.5 12h15M4.5 17h15"/></svg>';
    const tPanel = document.createElement('nav');
    tPanel.id = 'top-menu'; tPanel.className = 'menu-panel top-menu'; tPanel.setAttribute('aria-label', 'Pages'); tPanel.hidden = true;
    tPanel.innerHTML = panel.innerHTML;
    wrap.appendChild(tBtn); wrap.appendChild(tPanel);
    const setTop = open => {
      tPanel.hidden = !open; tBtn.setAttribute('aria-expanded', String(open));
      if (open) { setMenu(false); const first = tPanel.querySelector('a'); if (first) first.focus(); }
    };
    tBtn.addEventListener('click', e => { e.stopPropagation(); setTop(tPanel.hidden); });
    document.addEventListener('click', e => { if (!tPanel.hidden && !tPanel.contains(e.target)) setTop(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !tPanel.hidden) { setTop(false); tBtn.focus(); } });
  }
  const showTop = () => {
    const on = scrollY > innerHeight * 0.8;
    const onHome = !!document.querySelector('.hero');
    top.classList.toggle('show', on);
    // subpages keep the menu visible from the start; it slides into the corner while back-to-top is hidden
    menuBtn.classList.toggle('show', on || !onHome);
    menuBtn.classList.toggle('solo', !on && !onHome);
    panel.classList.toggle('solo', !on && !onHome);
    if (!on && onHome && !panel.hidden) setMenu(false);
  };
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
  // Writing & tools: rows open into a card, one at a time
  document.querySelectorAll('[data-xlist]').forEach(list => {
    list.classList.add('js');
    const items = [...list.querySelectorAll('.x')];
    const set = (li, on) => { li.classList.toggle('open', on); li.querySelector('.x-row').setAttribute('aria-expanded', on); };
    items.forEach(li => li.querySelector('.x-row').addEventListener('click', () => {
      const on = !li.classList.contains('open');
      items.forEach(o => set(o, o === li && on));
      list.classList.toggle('has-open', on);
    }));
  });
  // Publications: a night sky of planets (oldest on the left) and a rocket that flies the route; or the plain list
  const pubs = document.querySelector('[data-pubs]');
  if (pubs) {
    const listWrap = pubs.querySelector('.pub-list');
    const lis = [...listWrap.querySelectorAll('ol > li')].reverse();
    const PL = [
      { x: 150, y: 214, r: 25, tone: 'pink',   shine: '#f7a8c2', kind: 'face' },
      { x: 330, y: 128, r: 33, tone: 'peach',  shine: '#ffc39b', kind: 'craters' },
      { x: 505, y: 228, r: 29, tone: 'lilac',  shine: '#cfa9f2', kind: 'moon' },
      { x: 690, y: 126, r: 46, tone: 'aqua',   shine: '#8fe0d0', kind: 'bands' },
      { x: 878, y: 214, r: 40, tone: 'blue',   shine: '#9cc0ff', kind: 'ring' },
    ];
    if (lis.length && lis.length <= PL.length) {
      const P = PL.slice(PL.length - lis.length);
      const f = n => n.toFixed(1);
      let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      const wob = (cx, cy, r, s, a0 = 0, sweep = 360, close = false) => {
        const pts = [];
        for (let a = 0; a <= sweep; a += 5) {
          const t = (a0 + a) * Math.PI / 180, rr = r * (1 + .014 * Math.sin(3 * t + s) + .009 * Math.sin(5 * t + 2 * s));
          pts.push(f(cx + rr * Math.cos(t)) + ' ' + f(cy + rr * Math.sin(t)));
        }
        return 'M' + pts.join(' L') + (close ? 'Z' : '');
      };
      const arc = (cx, cy, r, a0, a1) => { const p = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)].map(f).join(' ');
        return `M${p(a0)} A${f(r)} ${f(r)} 0 0 1 ${p(a1)}`; };

      // stars
      let stars = '';
      for (let i = 0; i < 70; i++) {
        const x = rnd() * 1000, y = rnd() * 300, rr = .5 + rnd() * 1.1, tw = rnd() < .35;
        stars += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}"${tw ? ` class="tw" style="animation-delay:-${f(rnd() * 3.6)}s"` : ` opacity="${f(.25 + rnd() * .5)}"`}/>`;
      }
      for (let i = 0; i < 7; i++) {
        const x = 40 + rnd() * 920, y = 20 + rnd() * 120, k = 3 + rnd() * 3;
        stars += `<path class="tw" style="animation-delay:-${f(rnd() * 3.6)}s" d="M${f(x)} ${f(y - k)} Q${f(x)} ${f(y)} ${f(x + k)} ${f(y)} Q${f(x)} ${f(y)} ${f(x)} ${f(y + k)} Q${f(x)} ${f(y)} ${f(x - k)} ${f(y)} Q${f(x)} ${f(y)} ${f(x)} ${f(y - k)}Z"/>`;
      }

      // planets
      const planetsSVG = P.map((p, i) => {
        const { x, y, r } = p, s = i * 1.7 + .4, id = 'pc' + i;
        let back = '', deco = '', front = '';
        const ring = (sign) => { const rx = r * 1.85, ry = r * .4;
          return [1, .8].map(k => `<path class="pen${k < 1 ? ' thin' : ''}" d="M${f(x - rx * k)} ${f(y)} A${f(rx * k)} ${f(ry * k)} 0 0 ${sign} ${f(x + rx * k)} ${f(y)}"/>`).join(''); };
        if (p.kind === 'ring') { back = `<g transform="rotate(-12 ${x} ${y})">${ring(1)}</g>`; front = `<g transform="rotate(-12 ${x} ${y})"><path class="pen" d="M${f(x + r * 1.85)} ${f(y)} A${f(r * 1.85)} ${f(r * .4)} 0 0 1 ${f(x - r * 1.85)} ${f(y)}"/><path class="pen thin" d="M${f(x + r * 1.48)} ${f(y)} A${f(r * 1.48)} ${f(r * .32)} 0 0 1 ${f(x - r * 1.48)} ${f(y)}"/></g>`; }
        if (p.kind === 'bands') {
          const ys = [-.62, -.3, .02, .34, .64];
          deco = ys.slice(0, -1).map((a, k) => k % 2 ? '' : `<path class="band" style="--band:var(--field-${k === 2 ? 'blue' : 'mint'})" d="M${f(x - r)} ${f(y + a * r)} Q${f(x)} ${f(y + a * r + 7)} ${f(x + r)} ${f(y + a * r)} L${f(x + r)} ${f(y + ys[k + 1] * r)} Q${f(x)} ${f(y + ys[k + 1] * r + 7)} ${f(x - r)} ${f(y + ys[k + 1] * r)}Z"/>`).join('')
            + ys.map(a => `<path class="pen thin" d="M${f(x - r)} ${f(y + a * r)} Q${f(x)} ${f(y + a * r + 7)} ${f(x + r)} ${f(y + a * r)}"/>`).join('');
        }
        if (p.kind === 'craters') deco = [[-.35, -.25, .2], [.3, .2, .14], [-.1, .45, .11]].map(([a, b, k], n) =>
          `<path class="pen thin crater" d="${wob(x + a * r, y + b * r, k * r, n + 2, 0, 360, true)}"/>`).join('');
        if (p.kind === 'face') deco = `<circle cx="${f(x - r * .3)}" cy="${f(y - r * .18)}" r="1.8" fill="currentColor"/><circle cx="${f(x + r * .26)}" cy="${f(y - r * .2)}" r="1.8" fill="currentColor"/><path class="pen thin" d="M${f(x - r * .32)} ${f(y + r * .16)} Q${f(x)} ${f(y + r * .46)} ${f(x + r * .3)} ${f(y + r * .14)}"/>`;
        if (p.kind === 'moon') front = `<ellipse class="pen thin" cx="${x}" cy="${y}" rx="${r + 22}" ry="9" stroke-dasharray="1 5" transform="rotate(-8 ${x} ${y})" opacity=".7"/><circle class="pen moon" r="5.5" cx="${x + r + 22}" cy="${y}" style="fill:var(--sky-bg)"/>`;
        const hatch = [0, 1, 2].map(k => `<path class="pen hatch" d="${arc(x, y, r * (.6 + .12 * k), 25 + k * 4, 75 - k * 6)}"/>`).join('');
        const li = lis[i], title = (li.querySelector('a') || li).textContent.trim().replace(/\s+/g, ' ');
        const yr = (li.querySelector('.gloss') || li).textContent.trim().slice(0, 4);
        const yl = y + r + (p.kind === 'moon' ? 18 : p.kind === 'ring' ? 20 : 14); p.ly = yl;
        return `<g class="planet" data-i="${i}" tabindex="0" role="button" aria-label="${title.replace(/"/g, '&quot;')} (${yr}). Fly the rocket here" style="--tone:var(--field-${p.tone});--shine:${p.shine}">
          <clipPath id="${id}"><path d="${wob(x, y, r, s, 0, 360, true)}"/></clipPath>
          <circle class="hit" cx="${x}" cy="${y}" r="${r + 26}"/>
          <circle class="halo" cx="${x}" cy="${y}" r="${r + 9}"/>
          <g class="pl">${back}<path class="fill" d="${wob(x, y, r, s, 0, 360, true)}"/><g clip-path="url(#${id})">${deco}${hatch}</g>
          <path class="pen" d="${wob(x, y, r, s, -110, 342)}"/><path class="pen thin" d="${wob(x, y, r + 1.2, s + .5, 210, 48)}"/>${front}</g>
</g>`;
      }).join('');

      // route through the landing spots, starting at the launch rock
      const PAD = [62, 300];
      const nodes = [PAD, ...P.map(p => [p.x, p.y - p.r - 1])];
      let route = `M${nodes[0].join(' ')}`;
      for (let i = 0; i < nodes.length - 1; i++) {
        const p0 = nodes[Math.max(0, i - 1)], p1 = nodes[i], p2 = nodes[i + 1], p3 = nodes[Math.min(nodes.length - 1, i + 2)];
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6 - 26], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6 - 26];
        route += ` C${c1.map(f).join(' ')} ${c2.map(f).join(' ')} ${p2.join(' ')}`;
      }

      const tagsHTML = P.map((p, i) => {
        const li = lis[i], a = li.querySelector('a'), g = li.querySelector('.gloss');
        const kw = li.dataset.kw || (g ? g.textContent.slice(0, 4) : '');
        const name = a ? a.textContent : (li.lastChild.textContent || '').trim(), tt = li.dataset.target ? `<a href="#${li.dataset.target}">${name}</a>` : (a ? a.outerHTML : name);
        const al = p.x < 200 ? ' al' : p.x > 800 ? ' ar' : '';
        return `<div class="tag${al}" data-i="${i}" style="left:${p.x / 10}%;top:${f(p.ly / 3.4)}%;--shine:${p.shine}"><span class="kw">${kw}</span><div class="full"><div class="fin"><span class="gloss">${g ? g.textContent : ''}</span><span class="tt">${tt}</span></div></div></div>`;
      }).join('');

      const sky = document.createElement('div');
      sky.className = 'pub-sky';
      sky.innerHTML = `<div class="sky-scroll"><div class="sky-stage"><svg viewBox="0 0 1000 340" role="group" aria-label="Publications as planets, oldest on the left">
        <g class="stars" aria-hidden="true">${stars}</g>
        <path class="route" d="${route}" aria-hidden="true"/>
        <g aria-hidden="true"><path class="pen rock" d="M18 318 Q26 300 48 299 Q70 297 84 304 Q102 312 104 322"/><path class="pen thin" d="M40 309 q6 -3 12 0 M70 312 q5 -2 9 1"/></g>
        ${planetsSVG}
        <g class="rocket" aria-hidden="true"><g class="rk"><path class="pen flame" d=""/>
          <path class="pen body" d="M-7 0 C-8.5 -12 -6.5 -24 0 -35 C6.5 -24 8.5 -12 7 0 Z"/><path class="pen thin" d="M-7.6 -9 Q0 -7 7.6 -9"/>
          <circle class="pen win" cx="0" cy="-20" r="3.3"/><path class="pen" d="M-7 -8 Q-12 -4 -12.5 2 Q-9 0 -7 0 M7 -8 Q12 -4 12.5 2 Q9 0 7 0"/></g></g>
        <text class="hint" x="985" y="332" text-anchor="end" aria-hidden="true">hover a planet · click to fly there</text>
      </svg><div class="sky-tags">${tagsHTML}</div></div></div>`;
      const info = document.createElement('div');
      info.className = 'sky-info idle'; info.setAttribute('aria-live', 'polite');
      const IDLE = '<span class="gloss">Five papers, oldest on the left. Pick a planet to visit one.</span>';
      info.innerHTML = IDLE;

      const tog = document.createElement('div');
      tog.className = 'view-toggle'; tog.setAttribute('role', 'group'); tog.setAttribute('aria-label', 'Publications view');
      tog.innerHTML = '<button type="button" data-v="sky">✦ Sky</button><button type="button" data-v="list">≡ List</button>';
      const nav = document.createElement('div');
      nav.className = 'sky-nav'; nav.setAttribute('role', 'group'); nav.setAttribute('aria-label', 'Fly between planets');
      nav.innerHTML = '<button type="button" data-d="-1" aria-label="Previous planet">←</button><button type="button" data-d="1" aria-label="Next planet">→</button>';
      const bar = document.createElement('div');
      bar.className = 'sky-bar'; bar.append(tog, nav);
      listWrap.before(bar, sky, info);

      const svg = sky.querySelector('svg'), routeEl = sky.querySelector('.route');
      const rocket = sky.querySelector('.rocket'), flame = sky.querySelector('.flame');
      const starsG = sky.querySelector('.stars'), moon = sky.querySelector('.moon');
      const planets = [...sky.querySelectorAll('.planet')];
      const pls = planets.map(g => g.querySelector('.pl'));
      const tags = [...sky.querySelectorAll('.tag')];
      const measure = () => tags.forEach(t => { const w = t.querySelector('.kw').offsetWidth; if (w) t.style.setProperty('--kw', w + 'px'); });
      const fit = () => { sky.classList.toggle('narrow', sky.clientWidth < 580); measure(); };
      addEventListener('resize', fit);
      if (document.fonts) document.fonts.ready.then(measure);

      // where along the route each node sits
      const L = routeEl.getTotalLength(), at = [0];
      for (let n = 1, l = 0; n < nodes.length; n++) {
        let best = 1e9, bl = l;
        for (; l <= L; l += 2) { const q = routeEl.getPointAtLength(l), d = Math.hypot(q.x - nodes[n][0], q.y - nodes[n][1]); if (d < best) { best = d; bl = l; } else if (d > best + 30) break; }
        at.push(bl); l = bl + 2;
      }

      let hov = -1, closeT = 0;
      const openTag = () => { tags.forEach((t, n) => { t.classList.toggle('open', n === hov); t.classList.toggle('sel', n === sel); const l = t.querySelector('a'); if (l) l.tabIndex = n === hov ? 0 : -1; }); planets.forEach((g, n) => g.classList.toggle('hot', n === hov)); };
      let cur = 0, fly = null, here = -1, sel = -1, ang = 0, raf = 0, last = 0, tm = 0;
      const sq = P.map(() => ({ x: 1, v: 0 }));
      let px = 0, py = 0, tx = 0, ty = 0;
      const show = i => { if (i < 0) { info.innerHTML = IDLE; info.classList.add('idle'); } else { info.innerHTML = lis[i].innerHTML; info.classList.remove('idle'); } };
      const place = (l, a, flameLen) => {
        const q = routeEl.getPointAtLength(Math.max(0, Math.min(L, l)));
        rocket.setAttribute('transform', `translate(${f(q.x)} ${f(q.y)}) rotate(${f(a)}) scale(1.05)`);
        flame.setAttribute('d', flameLen > .5 ? `M-4.5 1 Q-3 ${f(1 + flameLen * .7)} 0 ${f(1 + flameLen)} Q3 ${f(1 + flameLen * .7)} 4.5 1Z` : '');
      };
      const goTo = i => {
        const el = document.getElementById(lis[i].dataset.target || '');
        if (!el) return;
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
      };
      const visit = (i, go) => {
        sel = i; show(i); openTag();
        const sc = sky.querySelector('.sky-scroll');
        if (sc.scrollWidth > sc.clientWidth) sc.scrollTo({ left: P[i].x / 1000 * sc.scrollWidth - sc.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
        planets.forEach((g, k) => g.classList.toggle('here', k === i && here === i));
        if (here === i && !fly) { if (go) goTo(i); return; }
        if (reduce) { cur = at[i + 1]; here = i; ang = 0; place(cur, 0, 0); planets.forEach((g, k) => g.classList.toggle('here', k === i)); if (go) setTimeout(() => goTo(i), 250); return; }
        const dist = Math.abs(at[i + 1] - cur);
        fly = { from: cur, to: at[i + 1], t0: tm, dur: Math.min(2.4, .7 + dist / 520), i, go };
        here = -1; planets.forEach(g => g.classList.remove('here'));
        kick();
      };
      planets.forEach((g, i) => {
        g.addEventListener('click', () => visit(i, true));
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); visit(i, true); } });
        const enter = () => { clearTimeout(closeT); hov = i; openTag(); show(i); };
        const leave = () => { clearTimeout(closeT); closeT = setTimeout(() => { hov = -1; openTag(); show(sel); }, 180); };
        [g, tags[i]].forEach(el => { el.addEventListener('mouseenter', enter); el.addEventListener('mouseleave', leave); });
        g.addEventListener('focus', enter); g.addEventListener('blur', leave);
        tags[i].addEventListener('click', e => { const l = e.target.closest('a'); if (l && !l.getAttribute('href').startsWith('#')) return; if (l) e.preventDefault(); visit(i, true); });
      });
      svg.addEventListener('pointermove', e => { const b = svg.getBoundingClientRect(); tx = ((e.clientX - b.left) / b.width - .5) * -10; ty = ((e.clientY - b.top) / b.height - .5) * -6; kick(); });
      svg.addEventListener('pointerleave', () => { tx = ty = 0; kick(); });

      const ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      const norm = a => ((a + 540) % 360) - 180;
      const frame = now => {
        raf = 0;
        const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; tm += dt;
        let busy = false;
        // stars drift with the pointer
        px += (tx - px) * Math.min(1, dt * 4); py += (ty - py) * Math.min(1, dt * 4);
        starsG.setAttribute('transform', `translate(${f(px)} ${f(py)})`);
        if (Math.abs(tx - px) + Math.abs(ty - py) > .05) busy = true;
        // rocket
        if (fly) {
          const u = Math.min(1, (tm - fly.t0) / fly.dur), e = ease(u), dir = Math.sign(fly.to - fly.from) || 1;
          cur = fly.from + (fly.to - fly.from) * e;
          const a1 = routeEl.getPointAtLength(Math.max(0, cur - 2 * dir)), a2 = routeEl.getPointAtLength(Math.min(L, cur + 2 * dir));
          const heading = norm(Math.atan2(a2.y - a1.y, a2.x - a1.x) * 180 / Math.PI + 90 - (dir < 0 ? 180 : 0));
          const w = Math.min(1, Math.min(u, 1 - u) * 6);
          const target = heading * w;
          ang += norm(target - ang) * Math.min(1, dt * 14);
          place(cur, ang, 9 + Math.sin(tm * 40) * 2.5 + rnd() * 2);
          if (u >= 1) { const done = fly; if (done.go) setTimeout(() => goTo(done.i), 450); here = fly.i; sq[here].v = -2.4; planets[here].classList.add('here'); fly = null; place(cur, 0, 0); ang = 0; }
          busy = true;
        }
        // planets squash a little when the rocket lands
        sq.forEach((s, k) => {
          if (Math.abs(s.x - 1) < .0005 && Math.abs(s.v) < .001) return;
          s.v += (-260 * (s.x - 1) - 12 * s.v) * dt; s.x += s.v * dt; busy = true;
          const p = P[k]; pls[k].setAttribute('transform', `translate(${p.x} ${p.y + p.r}) scale(${f(2 - s.x)} ${s.x.toFixed(4)}) translate(${-p.x} ${-p.y - p.r})`);
        });
        // the moon keeps orbiting
        if (moon && !reduce) {
          const p = P.find(q => q.kind === 'moon'), a = tm * .7, rx = p.r + 22;
          const mx = p.x + rx * Math.cos(a), my = p.y + 9 * Math.sin(a) - Math.cos(a) * rx * Math.tan(8 * Math.PI / 180) * .9;
          moon.setAttribute('cx', f(mx)); moon.setAttribute('cy', f(my));
          moon.style.opacity = Math.sin(a) < -.15 && Math.abs(mx - p.x) < p.r ? '0' : '1';
          busy = true;
        }
        if (busy && !sky.hidden && !document.hidden) kick();
      };
      const kick = () => { if (!raf) { raf = requestAnimationFrame(frame); } };
      document.addEventListener('visibilitychange', () => { last = 0; kick(); });
      place(0, 0, 0);

      // view toggle, remembered per visitor
      const btns = [...tog.querySelectorAll('button')];
      const setView = v => {
        btns.forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
        sky.hidden = info.hidden = nav.hidden = v !== 'sky'; listWrap.hidden = v === 'sky';
        try { localStorage.setItem('pubView', v); } catch (e) {}
        if (v === 'sky') { last = 0; kick(); fit(); }
      };
      btns.forEach(b => b.addEventListener('click', () => setView(b.dataset.v)));
      // previous / next planet
      const navBtns = [...nav.querySelectorAll('button')];
      const syncNav = () => { const k = fly ? fly.i : sel; navBtns[0].disabled = k <= 0; navBtns[1].disabled = k >= P.length - 1; };
      navBtns.forEach(b => b.addEventListener('click', () => {
        const k = fly ? fly.i : sel, d = +b.dataset.d;
        visit(k < 0 ? (d > 0 ? 0 : P.length - 1) : Math.max(0, Math.min(P.length - 1, k + d))); syncNav();
      }));
      planets.forEach(g => g.addEventListener('click', syncNav));
      tags.forEach(t => t.addEventListener('click', syncNav));
      syncNav(); openTag();
      let v0 = 'sky'; try { v0 = localStorage.getItem('pubView') || 'sky'; } catch (e) {}
      setView(v0 === 'list' ? 'list' : 'sky');
    }
  }
  // little friends peeking up from the bottom of the page; hover or tap one and it shares a fun project
  const BOT_SVG = `<svg viewBox="0 0 92 74" aria-hidden="true">
          <g class="ant"><path class="pen" d="M35 20 Q33.6 14.5 32.2 11.2 M57 20 Q58.6 14.4 59.9 11.2"/>
          <path class="pen tip" d="M31.9 5.4 Q35.6 5.5 35.4 8.6 Q35.2 11.9 31.7 11.8 Q28.5 11.6 28.6 8.5 Q28.8 5.4 31.9 5.4Z M60.2 5.3 Q63.4 5.4 63.4 8.6 Q63.3 11.8 60 11.8 Q56.7 11.7 56.9 8.4 Q57.1 5.3 60.2 5.3Z"/></g>
          <path class="pen ear" d="M22 29.6 L18.2 29.3 Q14.6 29.4 14.8 33 L14.9 40.2 Q14.8 43.7 18.1 43.8 L22.4 43.5 M70 29.6 L73.8 29.2 Q77.4 29.5 77.2 33.2 L77.1 40 Q77.3 43.6 73.9 43.8 L69.6 43.5"/>
          <path class="pen head" d="M34 19.5 C46 18.6 58 19.2 63 19.4 C71 19.8 75.3 24 75 32 C74.8 40 75.4 52 74.8 60 C74.5 68 74 74 74 74 L17.2 74 C17.2 74 17 66 17.1 58 C17.2 48 17.2 41 17.2 35 C17.4 26 18.5 20.2 34 19.5Z"/>
          <path class="pen thin" d="M19.6 26 Q22.2 18.4 34 17.9"/>
          <g class="eyes"><circle class="dot" cx="37" cy="33" r="2.6"/><circle class="dot" cx="55" cy="33" r="2.6"/></g>
          <circle class="cheek" cx="31" cy="40.5" r="3"/><circle class="cheek" cx="61" cy="40.5" r="3"/>
          <path class="pen mouth" d="M40 40.5 Q46 45.6 52 40.4"/>
        </svg>`;
  const TREE_SVG = (() => {
    const n = v => v.toFixed(1);
    // a plush tier: round shoulders on top, a scalloped hem below
    const tier = (cx, top, bot, hw, bumps) => {
      let d = `M${n(cx - hw)} ${n(bot - 3)} C${n(cx - hw - 3)} ${n(top + (bot - top) * .35)} ${n(cx - hw * .55)} ${n(top)} ${n(cx)} ${n(top)} C${n(cx + hw * .55)} ${n(top)} ${n(cx + hw + 3)} ${n(top + (bot - top) * .35)} ${n(cx + hw)} ${n(bot - 3)}`;
      const w = 2 * hw / bumps;
      for (let k = 0; k < bumps; k++) { const x1 = cx + hw - w * (k + 1); d += ` Q${n(x1 + w / 2)} ${n(bot + 3 + (k % 2) * 1.2)} ${n(x1)} ${n(bot - 2 + (k % 2 ? 0 : 1.2))}`; }
      return d + 'Z';
    };
    const beads = ['pink', 'peach', 'yellow', 'pink', 'peach', 'yellow'];
    const garland = (x0, x1, y, sag, cnt, off) => {
      let s = `<path class="pen thin gl" d="M${n(x0)} ${n(y)} Q${n((x0 + x1) / 2)} ${n(y + sag * 2)} ${n(x1)} ${n(y)}"/>`;
      for (let k = 0; k < cnt; k++) { const t = (k + .5) / cnt, x = x0 + (x1 - x0) * t, yy = y + sag * 4 * t * (1 - t);
        s += `<circle class="pen bead" style="--b:var(--field-${beads[(k + off) % beads.length]})" cx="${n(x)}" cy="${n(yy)}" r="${k % 2 ? 1.9 : 2.4}"/>`; }
      return s;
    };
    const T = [[40, 66, 104, 37, 6], [40, 49, 74, 31, 5], [40, 34, 58, 25, 4], [40, 20, 43, 18, 3]];
    let g = '';
    T.forEach(([cx, top, bot, hw, bumps], i) => {
      g += `<path class="pen tier" d="${tier(cx, top, bot, hw, bumps)}"/>`;
      if (i === 0) g += garland(5, 75, 80, 1.5, 5, 0);
      if (i === 1) g += garland(11, 69, 64, 2.2, 6, 1);
      if (i === 2) g += garland(17, 63, 48, 2.2, 5, 2);
      if (i === 3) g += garland(24, 56, 33, 2, 4, 3) + `<path class="pen heart" d="M47.5 27.3 q-1.8 -2.2 -3.4 -.4 q-1.2 1.6 3.4 4.4 q4.6 -2.8 3.4 -4.4 q-1.6 -1.8 -3.4 .4Z"/>`;
    });
    const face = `<path class="pen chick" d="M40 77 C49 76.6 53.6 82 53.4 89 C53.2 96 48 100.4 40 100.2 C32 100.4 26.8 96 26.6 89 C26.4 82 31 76.6 40 77Z"/>
          <g class="eyes"><ellipse class="pen ceye" cx="34.4" cy="87" rx="2.7" ry="1.8"/><ellipse class="pen ceye" cx="45.6" cy="87" rx="2.7" ry="1.8"/></g>
          <ellipse class="cheek" cx="31.6" cy="91.4" rx="2.8" ry="1.8"/><ellipse class="cheek" cx="48.4" cy="91.4" rx="2.8" ry="1.8"/>
          <path class="pen beak" d="M37.6 90 L42.4 90 L40 92.6Z"/>`;
    const star = `<path class="pen star" d="M40 2.2 L42.6 8.2 L49 8.8 L44.2 13 L45.7 19.4 L40 16.1 L34.3 19.4 L35.8 13 L31 8.8 L37.4 8.2Z"/>`;
    return `<svg viewBox="0 0 80 104" aria-hidden="true"><g class="sway">${g}${face}${star}</g></svg>`;
  })();
  const FUN = [
    { who: 'bot', svg: BOT_SVG, label: 'A little robot has a fun project to show you',
      title: 'Turned my Claude Code into a Christmas market 🎄', text: 'Bring the festive market stroll straight to your cozy room.', href: 'https://github.com/bakeyeon/christmas-market-backdrop', go: 'Take a look' },
    { who: 'tree', svg: TREE_SVG, label: 'A Christmas tree has a fun project to show you',
      title: 'A plush Christmas tree made of 7,000 letters 🐥', text: 'It turns slowly in 3D, and the chick on the bottom tier blinks and chirps.', href: 'https://github.com/bakeyeon/ascii-tree', go: 'Take a look' },
  ];
  if (FUN.length && !document.querySelector('.peek')) {
    const peek = document.createElement('div');
    peek.className = 'peek';
    peek.innerHTML = FUN.map((f, i) => `<div class="pk pk-${f.who}">
        <div class="pk-say" id="pk-say-${i}" role="dialog" aria-label="Fun project">
          <button class="pk-x" type="button" aria-label="Close">×</button>
          <span class="label">Psst · fun project</span>
          <b>${f.title}</b><p>${f.text}</p><a class="pk-go" href="${f.href}">${f.go} <span aria-hidden="true">↗</span></a>
        </div>
        <button class="pk-btn" type="button" aria-expanded="false" aria-controls="pk-say-${i}" aria-label="${f.label}">${f.svg}</button>
      </div>`).join('');
    (document.querySelector('footer.site') || document.body).append(peek);
    const items = [...peek.querySelectorAll('.pk')];
    const place = () => { const pl = peek.getBoundingClientRect().left, vw = document.documentElement.clientWidth;
      items.forEach(it => { const x = it.offsetLeft + it.offsetWidth - 22, sy = it.querySelector('.pk-say').style;
        sy.setProperty('--sx', x + 'px'); sy.setProperty('--sw', Math.max(200, vw - pl - x - 12) + 'px'); }); };
    place(); addEventListener('resize', place);
    let pinned = null, hoverT = 0;
    const set = it => items.forEach(x => { const on = x === it; x.classList.toggle('open', on); x.querySelector('.pk-btn').setAttribute('aria-expanded', on); });
    const fine = matchMedia('(hover: hover)').matches;
    items.forEach(it => {
      const btn = it.querySelector('.pk-btn');
      if (fine) {
        it.addEventListener('mouseenter', () => { clearTimeout(hoverT); if (!pinned || pinned === it) set(it); });
        it.addEventListener('mouseleave', () => { if (!pinned) hoverT = setTimeout(() => set(null), 350); });
      }
      btn.addEventListener('click', () => { pinned = (pinned === it && it.classList.contains('open')) ? null : it; set(pinned); });
      it.querySelector('.pk-x').addEventListener('click', () => { pinned = null; set(null); btn.focus(); });
    });
    document.addEventListener('keydown', e => { const o = items.find(x => x.classList.contains('open')); if (e.key === 'Escape' && o) { pinned = null; set(null); o.querySelector('.pk-btn').focus(); } });
    document.addEventListener('click', e => { if (!peek.contains(e.target) && items.some(x => x.classList.contains('open'))) { pinned = null; set(null); } });
  }
  // silent demo loops: play only while on screen; with reduced motion, show controls instead of autoplay
  const loops = document.querySelectorAll('video[data-loop]');
  if (loops.length) {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    loops.forEach(v => { v.muted = true; if (still) { v.autoplay = false; v.pause(); v.controls = true; } });
    if (!still && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { const p = e.target.play(); if (p) p.catch(() => { e.target.controls = true; }); }
        else e.target.pause();
      }), { threshold: 0.35 });
      loops.forEach(v => io.observe(v));
    }
  }
  // sibling-project panels: their demo video plays only while the panel is open
  document.querySelectorAll('details.sib').forEach((d) => {
    d.addEventListener('toggle', () => {
      const v = d.querySelector('video');
      if (!v) return;
      if (d.open && !matchMedia('(prefers-reduced-motion: reduce)').matches) { const p = v.play(); if (p) p.catch(() => { v.controls = true; }); }
      else v.pause();
    });
  });
  // Seasonal themes, by the visitor's local date, both rendered in Blender:
  //   Christmas (Dec 1 – Dec 31): a winter sky, falling snow and an isometric town with twinkling lights.
  //   New Year (Jan 1 – Feb 9, through Seollal): a dawn sky, light snow and a snow globe with a sheep in hanbok.
  // The snowflake button turns the current theme off and remembers. ?theme=xmas / ?theme=newyear
  // preview a theme on any date, ?theme=off hides it (?xmas=1 / ?xmas=0 still work).
  (function () {
    const qs = new URLSearchParams(location.search);
    const forced = qs.get('theme') || ({ '1': 'xmas', '0': 'off' })[qs.get('xmas')] || null;
    const now = new Date(), mo = now.getMonth(), dd = now.getDate();
    let season = mo === 11 ? 'xmas' : (mo === 0 || (mo === 1 && dd <= 9)) ? 'newyear' : null;
    if (forced) season = forced;
    if (season !== 'xmas' && season !== 'newyear') return;
    const XMAS = season === 'xmas';
    const NAME = XMAS ? 'December theme' : 'New Year theme';
    const themeBtn = document.querySelector('.theme-btn');
    let snowBtn = null;
    if (themeBtn) {
      const wrap = document.createElement('span'); wrap.className = 'bar-right';
      themeBtn.parentNode.insertBefore(wrap, themeBtn);
      snowBtn = document.createElement('button');
      snowBtn.type = 'button'; snowBtn.className = 'theme-btn snow-btn';
      snowBtn.setAttribute('aria-label', NAME);
      snowBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.6 4.6 12 7l2.4-2.4M9.6 19.4 12 17l2.4 2.4M4.6 10.9l3.3-.9-.9-3.3M19.4 13.1l-3.3.9.9 3.3M4.6 13.1l3.3.9-.9 3.3M19.4 10.9l-3.3-.9.9-3.3"/></svg>';
      wrap.appendChild(snowBtn); wrap.appendChild(themeBtn);
    }
    let musicBtn = null;
    if (XMAS && snowBtn && document.querySelector('.hero')) {
      musicBtn = document.createElement('button');
      musicBtn.type = 'button'; musicBtn.className = 'theme-btn snow-btn music-btn';
      musicBtn.setAttribute('aria-label', 'Play Jingle Bells on chimes');
      musicBtn.title = 'Play Jingle Bells (chimes)';
      musicBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 17.5V5.5l10-2v12"/><circle cx="7" cy="17.5" r="2.5"/><circle cx="17" cy="15.5" r="2.5"/></svg>';
      snowBtn.parentNode.insertBefore(musicBtn, snowBtn);
    }

    // Jingle Bells (J. L. Pierpont, 1857, public domain) on synthesized chimes and sleigh bells: Web Audio
    // only, nothing to download, plays only after a click. Home page only, since moving to another page
    // reloads it and would cut the tune off mid-phrase.
    const carol = (function () {
      const HI = { C: 523.25, D: 587.33, E: 659.25, F: 698.46, G: 783.99 };
      const LO = { C: 130.81, D: 146.83, F: 174.61, G: 196.0, A: 220.0, C4: 261.63, D4: 293.66 };
      const hook = [['E', 1], ['E', 1], ['E', 2], ['E', 1], ['E', 1], ['E', 2], ['E', 1], ['G', 1], ['C', 1.5], ['D', .5], ['E', 4]];
      const mid = [['F', 1], ['F', 1], ['F', 1.5], ['F', .5], ['F', 1], ['E', 1], ['E', 1], ['E', .5], ['E', .5]];
      const tune = [...hook, ...mid, ['E', 1], ['D', 1], ['D', 1], ['E', 1], ['D', 2], ['G', 2],
                    ...hook, ...mid, ['G', 1], ['G', 1], ['F', 1], ['D', 1], ['C', 4]];
      // one chord per bar: root on beat 1, fifth on beat 3
      const bass = 'C C C C F C D G C C C C F C G C'.split(' ');
      const FIFTH = { C: 'G', F: 'C4', D: 'A', G: 'D4' };
      const BEAT = 60 / 152, LOOP = 64;
      let ctx = null, master = null, timer = 0, playing = false, noise = null;

      // a small metal chime (glockenspiel bar): fundamental, a slightly detuned twin for shimmer and
      // the inharmonic partials of a free bar, each fading faster than the last
      const CHIME = [[1, 1, 1], [1.003, .3, 1], [2.76, .3, .35], [5.4, .1, .18], [8.93, .04, .1]];
      function strike(out, f, t, vel, len) {
        CHIME.forEach(([m, amp, d]) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine'; o.frequency.value = f * m;
          g.gain.setValueAtTime(.0001, t);
          g.gain.exponentialRampToValueAtTime(vel * amp, t + .002);
          g.gain.exponentialRampToValueAtTime(.0001, t + len * d);
          o.connect(g); g.connect(out); o.start(t); o.stop(t + len * d + .05);
        });
      }
      // sleigh bells: a short burst of high, bright noise
      function jingle(out, t, vel) {
        if (!noise) {
          noise = ctx.createBuffer(1, Math.round(ctx.sampleRate * .25), ctx.sampleRate);
          const d = noise.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
        s.buffer = noise; hp.type = 'highpass'; hp.frequency.value = 6500;
        g.gain.setValueAtTime(.0001, t);
        g.gain.exponentialRampToValueAtTime(vel, t + .004);
        g.gain.exponentialRampToValueAtTime(.0001, t + .14);
        s.connect(hp); hp.connect(g); g.connect(out); s.start(t); s.stop(t + .2);
      }
      function schedule(t0) {
        let t = t0;
        tune.forEach(([n, b]) => { strike(master, HI[n] * 2, t, .3, 1.5); t += b * BEAT; });
        bass.forEach((c, k) => {
          const bt = t0 + k * 4 * BEAT;
          strike(master, LO[c] * 2, bt, .11, 1.0);
          if (k < bass.length - 1) strike(master, LO[FIFTH[c]] * 2, bt + 2 * BEAT, .08, .8);
          [1, 3].forEach(b => jingle(master, bt + b * BEAT, .07));
          jingle(master, bt + 3.5 * BEAT, .035);
        });
        return t0 + (LOOP + 2) * BEAT;
      }
      function play() {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ctx = ctx || new AC();
        ctx.resume();
        master = ctx.createGain(); master.gain.value = .5;
        const echo = ctx.createDelay(), fb = ctx.createGain(), tone = ctx.createBiquadFilter();
        echo.delayTime.value = .18; fb.gain.value = .15; tone.type = 'lowpass'; tone.frequency.value = 5000;
        master.connect(ctx.destination); master.connect(echo); echo.connect(tone); tone.connect(fb); fb.connect(echo); tone.connect(ctx.destination);
        let t = ctx.currentTime + .08;
        const loop = () => { t = schedule(t); timer = setTimeout(loop, Math.max(0, (t - ctx.currentTime - 1) * 1000)); };
        loop(); playing = true;
        return true;
      }
      function stop() {
        clearTimeout(timer); playing = false;
        if (!master) return;
        const m = master; master = null;
        m.gain.setTargetAtTime(0, ctx.currentTime, .08);
        setTimeout(() => { m.disconnect(); if (!master && ctx) ctx.suspend(); }, 500);
      }
      return { play, stop, get playing() { return playing; } };
    })();
    const syncMusic = () => { if (musicBtn) musicBtn.setAttribute('aria-pressed', String(carol.playing)); };
    if (musicBtn) musicBtn.addEventListener('click', () => {
      if (carol.playing) carol.stop(); else carol.play();
      syncMusic();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden && carol.playing) { carol.stop(); syncMusic(); } });
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const isDark = () => root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && mq.matches);

    function snowfall(host) {
      const cv = document.createElement('canvas');
      cv.className = 'xmas-snow'; cv.setAttribute('aria-hidden', 'true');
      const sky = host.querySelector('.sky');
      host.insertBefore(cv, host.querySelector('.wash') || (sky ? sky.nextSibling : null));
      const ctx = cv.getContext('2d');
      let w = 0, h = 0, flakes = [], raf = 0, last = 0, seen = true;
      const make = top => ({ x: Math.random() * w, y: top ? -4 : Math.random() * h, r: .7 + Math.random() * 2.1,
        v: .35 + Math.random() * .55, ph: Math.random() * 6.3, a: .5 + Math.random() * .45 });
      function size() {
        const dpr = Math.min(2, devicePixelRatio || 1);
        w = cv.clientWidth; h = cv.clientHeight;
        cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const n = Math.round(Math.min(150, w * h / 9500));
        while (flakes.length < n) flakes.push(make(false));
        flakes.length = n;
      }
      function paint() {
        ctx.clearRect(0, 0, w, h);
        const dark = isDark();
        for (const f of flakes) {
          const x = f.x + Math.sin(f.ph) * 7;
          if (!dark) { ctx.fillStyle = 'rgba(70,95,150,' + (.16 * f.a) + ')'; ctx.beginPath(); ctx.arc(x, f.y, f.r + .7, 0, 6.3); ctx.fill(); }
          ctx.fillStyle = 'rgba(255,255,255,' + f.a + ')'; ctx.beginPath(); ctx.arc(x, f.y, f.r, 0, 6.3); ctx.fill();
        }
      }
      function tick(t) {
        const k = last ? Math.min(3, (t - last) / 16.7) : 1; last = t;
        for (const f of flakes) {
          f.y += f.v * (.6 + f.r * .45) * k; f.ph += .012 * k;
          if (f.y > h + 4) Object.assign(f, make(true));
        }
        paint();
        raf = requestAnimationFrame(tick);
      }
      const run = () => { if (!raf && !reduce && seen && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } };
      const halt = () => { cancelAnimationFrame(raf); raf = 0; };
      size(); paint(); run();
      const onResize = () => { size(); paint(); };
      addEventListener('resize', onResize);
      const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { seen = es[0].isIntersecting; if (seen) run(); else halt(); }) : null;
      if (io) io.observe(host);
      const onVis = () => { if (document.hidden) halt(); else run(); };
      document.addEventListener('visibilitychange', onVis);
      return () => { halt(); if (io) io.disconnect(); removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVis); cv.remove(); };
    }

    let stops = [], town = null, banner = null;
    // The town is a base render with the tree lights dimmed, plus three small layers over the tree,
    // each with one group of bulbs lit; CSS fades them in turn so the lights twinkle.
    const setTownSrc = () => {
      if (!town) return;
      if (!XMAS) {   // the globe's light is off by day and on at night
        town.firstChild.src = 'assets/img/newyear-globe-' + (isDark() ? 'night' : 'day') + '.webp';
        return;
      }
      const m = isDark() ? 'night' : 'day';
      town.querySelectorAll('img').forEach(img => {
        img.src = img.dataset.g === undefined ? 'assets/img/xmas-town-' + m + '.webp' : 'assets/img/xmas-lights-' + m + '-' + img.dataset.g + '.webp';
      });
    };
    function on() {
      root.classList.add('xmas');
      if (!XMAS) root.classList.add('newyear');
      if (musicBtn) musicBtn.hidden = false;
      stops = [...document.querySelectorAll('.hero, .page-head')].map(snowfall);
      const hero = document.querySelector('.hero');
      if (hero && !XMAS) {
        town = document.createElement('div');
        town.className = 'xmas-town globe';
        town.innerHTML = '<img class="town-base" alt="" width="560" height="645" decoding="async">';
        town.firstChild.addEventListener('load', () => { if (town) town.classList.add('in'); });
        setTownSrc();
        hero.insertBefore(town, hero.querySelector('.wash'));
        // a small cloth banner hung across the front of the globe's base
        banner = document.createElement('p');
        banner.className = 'ny-banner';
        banner.innerHTML = '<svg class="ny-strings" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">' +
          '<path d="M10 20 L50 2 L90 20"/><circle cx="50" cy="2" r="1.6"/></svg>' +
          '<span class="en">Happy New Year 2027</span>';
        town.appendChild(banner);
      } else if (hero) {
        town = document.createElement('div');
        town.className = 'xmas-town'; town.setAttribute('aria-hidden', 'true');
        town.innerHTML = '<img class="town-base" alt="" width="720" height="504" decoding="async">' +
          [0, 1, 2].map(g => '<img class="town-lights" data-g="' + g + '" alt="" width="189" height="198" decoding="async">').join('');
        town.firstChild.addEventListener('load', () => { if (town) town.classList.add('in'); });
        setTownSrc();
        hero.insertBefore(town, hero.querySelector('.wash'));
      }
    }
    function off() {
      root.classList.remove('xmas', 'newyear');
      stops.forEach(s => s()); stops = [];
      if (town) { town.remove(); town = null; }
      if (banner) { banner.remove(); banner = null; }
      if (carol.playing) carol.stop();
      syncMusic();
      if (musicBtn) musicBtn.hidden = true;
    }
    const swap = setTownSrc;
    new MutationObserver(swap).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    if (mq.addEventListener) mq.addEventListener('change', swap);

    const KEY = 'theme-' + season;
    let enabled = !!forced || store.get(KEY) !== 'off';
    const sync = () => {
      if (!snowBtn) return;
      snowBtn.setAttribute('aria-pressed', String(enabled));
      snowBtn.title = (enabled ? 'Turn off the ' : 'Turn on the ') + NAME;
    };
    if (enabled) on(); else if (musicBtn) musicBtn.hidden = true;
    sync(); syncMusic();
    if (snowBtn) snowBtn.addEventListener('click', () => {
      enabled = !enabled; store.set(KEY, enabled ? 'on' : 'off');
      if (enabled) on(); else off();
      sync();
    });
  })();
})();
