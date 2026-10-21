(() => {
'use strict';
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= EDIT BUSINESS DETAILS HERE ================= */
const SITE = {
  phone: '01273 978 967', mobile: '07802 805 505', email: 'info@lotb-ltd.com',
  hours: ['Mon to Fri 09:00 to 19:00', 'Sat and Sun 10:00 to 17:00'],
  licence: 'CBDU401377',
  licenceUrl: 'https://environment.data.gov.uk/public-register/waste-carriers-brokers/registration/CBDU401377',
  checkatrade: 'https://www.checkatrade.com/trades/lotb1024930', rating: '9.92',
  facebook: 'https://www.facebook.com/lordofthebins/', instagram: 'https://www.instagram.com/the_lordofthebins/'
};
/* Paste a Formspree / GoHighLevel / Make webhook URL here. If empty, forms open a pre-filled email instead. */
const FORM_ENDPOINT = '';
/* Existing Elfsight WhatsApp chat from the old site. Set to '' to turn off. */
const WHATSAPP_WIDGET = 'elfsight-app-3964db52-9772-41e5-9f9c-faada2ab63b7';
/* Optional hero video frames (frames/0001.webp ...). If they exist they are used instead of the photo story. */
const FRAMES = { path: 'frames/', ext: 'webp', count: 300, pad: 4 };

/* Hero photo story (used when there are no video frames).
   It tries each set in order and uses the first one where all photos exist.
   wide = desktop/landscape screens, tall = phones. */
const HERO = {
  wide: [
    { intro: 'images/services-hero.jpg', before: 'images/ba/01-before.jpg', after: 'images/ba/01-after.jpg' },
    { intro: 'images/services-hero.jpg', before: 'images/ba/09-before.jpg', after: 'images/ba/09-after.jpg' },
    { intro: 'images/services-hero.jpg', before: 'images/ba/06-before.jpg', after: 'images/ba/06-after.jpg' }
  ],
  tall: [
    { intro: 'images/team.jpg', before: 'images/ba/06-before.jpg', after: 'images/ba/06-after.jpg' },
    { intro: 'images/team.jpg', before: 'images/ba/14-before.jpg', after: 'images/ba/14-after.jpg' }
  ]
};

/* ================= BEFORE / AFTER JOBS =================
   Photos: images/ba/NN-before.jpg and images/ba/NN-after.jpg
   Add a new job = add one line here. Categories: residential, building, business */
const WORK = [
  ['01', 'Garage clear-out', 'residential', 'A packed garage emptied and swept in one visit.'],
  ['02', 'Bagged rubbish and boards', 'residential', 'A wall of rubbish bags and old boards cleared from the pavement.'],
  ['03', 'Builders waste under scaffold', 'building', 'Roofing offcuts, boards and buckets cleared from a live site.'],
  ['04', 'Garage timber and junk', 'residential', 'Old fence timber, carpet and boxes taken away.'],
  ['05', 'Office refit waste', 'business', 'Strip-out waste removed so the fit-out could carry on.'],
  ['06', 'Garage of bags and insulation', 'building', 'Old insulation, bagged waste and doors cleared.'],
  ['07', 'Driveway furniture clearance', 'residential', 'Chairs, shelving and packaging cleared from a front drive.'],
  ['08', 'Rubble removal', 'building', 'Bricks and hardcore cleared from a tight side return.'],
  ['09', 'Garage demolition', 'building', 'An old garage taken down and cleared, leaving a clean base.'],
  ['10', 'Front garden clearance', 'residential', 'Bulk bag, timber and rubbish bags removed from a front garden.'],
  ['11', 'Commercial strip-out', 'business', 'A floor of demolition waste cleared and swept.'],
  ['12', 'Renovation waste', 'residential', 'Timber, plastic sheeting and packaging cleared from a corner.'],
  ['13', 'Side passage clearance', 'residential', 'Old mower, hoover and garden junk removed.'],
  ['14', 'Construction waste removal', 'building', 'A huge pile of building waste cleared from beside a house, leaving clean ground.']
];
const CATS = { residential: 'Residential', building: 'Building waste', business: 'Business' };

const tel = n => 'tel:' + n.replace(/\s/g, '');
const page = document.body.dataset.page || '';
const SERVICES = [
  ['residential.html', 'Residential', 'House, garden, loft and bereavement clearances', 'residential'],
  ['building.html', 'Building waste', 'Keep sites clear without skips or permits', 'building'],
  ['business.html', 'Local business', 'Collections and clearances for shops, bars and offices', 'business'],
  ['enterprise.html', 'Large enterprise', 'Fleet and manpower for big sites and councils', 'enterprise']
];
const isOn = p => p === page || (p === 'services' && SERVICES.some(s => s[3] === page));
const on = p => isOn(p) ? ' class="on"' : '';
const IC = {
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19l7-7"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/></svg>'
};

/* ---------- shared chrome ---------- */
const hd = $('#header');
if (hd) hd.outerHTML = `<a class="skip" href="#main">Skip to content</a>
<header class="nav" id="nav">
  <a class="brand" href="index.html" aria-label="Lord of the Bins home">LORD OF<br>THE BINS</a>
  <nav class="links" aria-label="Main">
    <a href="index.html"${on('home')}>Home</a>
    <div class="dd"><a href="services.html"${on('services')}>Services</a>
      <div class="dd-menu">${SERVICES.map(s => `<a href="${s[0]}"${on(s[3])}><b>${s[1]}</b><small>${s[2]}</small></a>`).join('')}</div></div>
    <a href="work.html"${on('work')}>Our work</a>
    <a href="about.html"${on('about')}>About</a>
    <a href="areas.html"${on('areas')}>Areas</a>
    <a href="contact.html"${on('contact')}>Contact</a>
  </nav>
  <div class="nav-cta">
    <a class="tel" href="${tel(SITE.phone)}">${SITE.phone}</a>
    <a class="btn btn-sm mag" href="quote.html">Free quote</a>
    <button class="burger" aria-label="Open menu" aria-expanded="false"><i></i><i></i></button>
  </div>
</header>`;

$$('[data-trust]').forEach(el => el.outerHTML = `<section class="trust" aria-label="Why you can trust us">
  <a href="${SITE.licenceUrl}" target="_blank" rel="noopener"><span class="ic">${IC.doc}</span><span><b>Upper Tier licensed</b><small>Waste carrier ${SITE.licence}</small></span></a>
  <div><span class="ic">${IC.shield}</span><span><b>Fully insured</b><small>Your property is protected</small></span></div>
  <a href="${SITE.checkatrade}" target="_blank" rel="noopener"><span class="ic">${IC.star}</span><span><b>Rated ${SITE.rating}/10</b><small>Verified on Checkatrade</small></span></a>
  <div><span class="ic">${IC.leaf}</span><span><b>97% recycled</b><small>Diverted from landfill</small></span></div>
</section>`);

$$('[data-cta]').forEach(el => el.outerHTML = `<div class="cta-wrap"><section class="cta-band reveal">
  <div><h2>Got something that needs to go?</h2><p>Send us a few photos and we will come back with a clear price. Same-day clearance is often available.</p></div>
  <div class="phero-btns"><a class="btn mag" href="quote.html">Get a free quote</a><a class="btn btn-ghost mag" href="${tel(SITE.phone)}">Call ${SITE.phone}</a></div>
</section></div>`);

const ft = $('#footer');
if (ft) ft.outerHTML = `<footer class="foot"><div class="foot-grid">
  <div><a class="brand" href="index.html">LORD OF<br>THE BINS</a>
    <p>Licensed and fully insured waste clearance across Brighton, Hove and Sussex. 97% of what we collect is kept out of landfill.</p>
    <a href="${SITE.licenceUrl}" target="_blank" rel="noopener">Upper Tier Waste Carrier ${SITE.licence}</a></div>
  <div><h4>Services</h4>${SERVICES.map(s => `<a href="${s[0]}">${s[1]}</a>`).join('')}<a href="services.html">All services</a></div>
  <div><h4>Company</h4><a href="about.html">About us</a><a href="work.html">Our work</a><a href="areas.html">Areas we cover</a><a href="quote.html">Get a quote</a><a href="contact.html">Contact</a><a href="${SITE.checkatrade}" target="_blank" rel="noopener">Checkatrade reviews</a></div>
  <div><h4>Contact</h4><a href="${tel(SITE.phone)}">${SITE.phone}</a><a href="${tel(SITE.mobile)}">${SITE.mobile}</a><a href="mailto:${SITE.email}">${SITE.email}</a>${SITE.hours.map(h => `<p>${h}</p>`).join('')}</div>
</div>
<div class="foot-bot"><span>&copy; ${new Date().getFullYear()} Lord of the Bins. All rights reserved.</span>
  <span><a href="${SITE.facebook}" target="_blank" rel="noopener">Facebook</a> &nbsp;·&nbsp; <a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram</a></span></div>
</footer>
<div class="mbar"><a href="${tel(SITE.phone)}">Call now</a><a href="quote.html" class="g">Free quote</a></div>`;

/* ---------- before / after renderers ---------- */
const baHTML = (w, cls = '') => `<div class="ba ${cls}">
  <div class="ba-img before" style="--img:url(images/ba/${w[0]}-before.jpg)"><b>Before</b></div>
  <div class="ba-img after" style="--img:url(images/ba/${w[0]}-after.jpg)"><b>After</b></div>
  <div class="ba-handle"><i></i></div>
  <input type="range" min="0" max="100" value="50" aria-label="Before and after slider: ${w[1]}"></div>`;

/* featured slider + thumbnail switcher: <div data-ba-featured></div> */
$$('[data-ba-featured]').forEach(el => {
  const w0 = WORK[0];
  el.innerHTML = `<div class="feat">${baHTML(w0, 'wide')}
    <div class="feat-cap"><h3>${w0[1]}</h3><p>${w0[3]}</p></div>
    <div class="thumbs-row">${WORK.map((w, i) => `<button type="button" data-id="${w[0]}" aria-label="Show ${w[1]}" class="${i ? '' : 'on'}" style="background-image:url(images/ba/${w[0]}-before.jpg)"></button>`).join('')}</div></div>`;
  const ba = $('.ba', el), r = $('input', ba), btns = $$('.thumbs-row button', el);
  const show = i => {
    const w = WORK[i];
    $('.before', ba).style.setProperty('--img', `url(images/ba/${w[0]}-before.jpg)`);
    $('.after', ba).style.setProperty('--img', `url(images/ba/${w[0]}-after.jpg)`);
    r.value = 50; ba.style.setProperty('--p', '50%');
    r.setAttribute('aria-label', `Before and after slider: ${w[1]}`);
    $('h3', el).textContent = w[1]; $('.feat-cap p', el).textContent = w[3];
    btns.forEach((x, j) => x.classList.toggle('on', j === i));
  };
  btns.forEach((btn, i) => btn.addEventListener('click', () => show(i)));
  el._show = show;
});

/* grid of cards: <div data-ba-gallery data-cat="building" data-limit="3" data-filters></div> */
$$('[data-ba-gallery]').forEach(el => {
  const cat = el.dataset.cat, lim = +el.dataset.limit || 99;
  const list = WORK.filter(w => !cat || w[2] === cat).slice(0, lim);
  const filters = el.hasAttribute('data-filters') ? `<div class="chips filters" role="group" aria-label="Filter jobs"><button type="button" class="on" data-f="">All jobs</button>${Object.entries(CATS).map(([k, v]) => `<button type="button" data-f="${k}">${v}</button>`).join('')}</div>` : '';
  el.innerHTML = filters + `<div class="work-grid">${list.map(w => `<article class="work-card reveal" data-id="${w[0]}" data-cat="${w[2]}">${baHTML(w, 'sm')}<span class="tag">${CATS[w[2]]}</span><h3>${w[1]}</h3><p>${w[3]}</p></article>`).join('')}</div>`;
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-f]'); if (!b) return;
    $$('.work-card', el).forEach(c => c.hidden = c.classList.contains('broken') || (!!b.dataset.f && c.dataset.cat !== b.dataset.f));
    setTimeout(() => $$('[data-f]', el).forEach(x => x.classList.toggle('on', x === b)));
  });
});

/* safety net: hide any job whose before or after photo is missing */
const pairOK = id => Promise.all(['before', 'after'].map(s => new Promise(res => {
  const im = new Image(); im.onload = () => res(true); im.onerror = () => res(false); im.src = `images/ba/${id}-${s}.jpg`;
}))).then(r => r.every(Boolean));
Promise.all(WORK.map(w => pairOK(w[0]))).then(res => {
  const bad = WORK.filter((w, i) => !res[i]).map(w => w[0]);
  if (!bad.length) return;
  console.warn('Before/after photos missing for job(s): ' + bad.join(', ') + '. Check images/ba/NN-before.jpg and NN-after.jpg');
  bad.forEach(id => $$(`[data-id="${id}"]`).forEach(x => { x.hidden = true; x.classList.add('broken'); }));
  const first = res.indexOf(true);
  $$('[data-ba-featured]').forEach(el => {
    const active = $('.thumbs-row button.on', el);
    if (first > -1 && (!active || active.hidden)) el._show(first);
  });
});

/* slider drag (works for every .ba on the page) */
document.addEventListener('input', e => {
  if (e.target.matches('.ba input')) e.target.closest('.ba').style.setProperty('--p', e.target.value + '%');
});

/* ---------- WhatsApp widget ---------- */
if (WHATSAPP_WIDGET) {
  const s = document.createElement('script'); s.src = 'https://static.elfsight.com/platform/platform.js'; s.async = true; document.body.appendChild(s);
  const d = document.createElement('div'); d.className = WHATSAPP_WIDGET; d.setAttribute('data-elfsight-app-lazy', ''); document.body.appendChild(d);
}

/* ---------- loader ---------- */
const loader = $('#loader');
if (loader) addEventListener('load', () => setTimeout(() => loader.classList.add('out'), 600));

/* ---------- image fallback (missing photos show placeholder) ---------- */
$$('.ph img').forEach(im => { const f = () => im.remove(); im.addEventListener('error', f); if (im.complete && !im.naturalWidth) f(); });

/* ---------- split headings ---------- */
$$('.split').forEach(h => {
  h.innerHTML = h.innerHTML.trim().split(/\s+/).map((w, i) => `<span class="w"><span style="transition-delay:${i * .06}s">${w}</span></span>`).join(' ');
});

/* ---------- reveal + counters ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); io.unobserve(e.target);
  $$('[data-count]', e.target).forEach(count);
}), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
$$('.reveal').forEach((el, i) => { el.style.setProperty('--d', (i % 4) * .08 + 's'); io.observe(el); });
function count(el) {
  if (el.dataset.done) return; el.dataset.done = 1;
  const to = +el.dataset.count, dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1800;
  (function tick(t) {
    const p = clamp((t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
    el.textContent = (to * e).toFixed(dec) + suf;
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

/* ---------- nav ---------- */
const nav = $('#nav'), bar = $('#progress'), burger = $('.burger');
let lastY = 0;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  if (!nav) return;
  nav.classList.toggle('solid', y > 40);
  nav.classList.toggle('hide', y > lastY && y > 500 && !nav.classList.contains('open') && !matchMedia('(max-width:1060px)').matches);
  lastY = y;
}
addEventListener('scroll', onScroll, { passive: true }); onScroll();
if (burger) burger.addEventListener('click', () => {
  const o = nav.classList.toggle('open');
  document.body.classList.toggle('lock', o);
  burger.setAttribute('aria-expanded', o);
  burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
});

/* ---------- cursor / magnetic / tilt ---------- */
const cur = $('#cursor');
if (cur && matchMedia('(hover:hover) and (pointer:fine)').matches) {
  let cx = 0, cy = 0, tx = 0, ty = 0;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function f() { cx = lerp(cx, tx, .18); cy = lerp(cy, ty, .18); cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(f); })();
  document.addEventListener('mouseover', e => cur.classList.toggle('big', !!e.target.closest('a,button,.drop,input[type=range],summary')));
}
if (!reduce && matchMedia('(hover:hover)').matches) $$('.mag').forEach(b => {
  b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; });
  b.addEventListener('mouseleave', () => b.style.transform = '');
});
$$('.tilt').forEach(c => {
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
    if (!reduce) { c.style.setProperty('--ry', (x - .5) * 8 + 'deg'); c.style.setProperty('--rx', (.5 - y) * 8 + 'deg'); }
  });
  c.addEventListener('mouseleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
});

/* ---------- HOME HERO: cinematic scroll story (video frames > real photos > procedural) ---------- */
const hero = $('#hero');
if (hero) {
  const cv = $('#scene'), ctx = cv.getContext('2d'), lines = $$('.line'), dots = $$('#dots i'), hint = $('.scroll-hint');
  let W, H, dpr, prog = 0, imgs = [], useFrames = false;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; };
  addEventListener('resize', size); size();

  /* 1. optional video frames */
  const pad = n => String(n).padStart(FRAMES.pad, '0');
  const first = new Image();
  first.onload = () => { useFrames = true; imgs[0] = first; for (let i = 2; i <= FRAMES.count; i++) { const im = new Image(); im.src = `${FRAMES.path}${pad(i)}.${FRAMES.ext}`; imgs[i - 1] = im; } };
  first.src = `${FRAMES.path}${pad(1)}.${FRAMES.ext}`;
  const drawFrame = p => {
    const im = imgs[Math.round(p * (FRAMES.count - 1))];
    if (!im || !im.complete || !im.naturalWidth) return;
    const s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
    ctx.drawImage(im, (W - im.naturalWidth * s) / 2, (H - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
  };

  /* 2. real-photo story */
  const loadImg = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  let photos = null, photoSet = '';
  const loadPhotos = async () => {
    const key = innerWidth < innerHeight * .9 ? 'tall' : 'wide';
    if (key === photoSet) return;
    photoSet = key;
    for (const set of HERO[key]) {
      const [intro, before, after] = await Promise.all([set.intro, set.before, set.after].map(loadImg));
      if (photoSet !== key) return;
      if (before && after) {
        photos = { intro: intro || before, before, after };
        console.info('Hero using:', set.before, '→', set.after);
        return;
      }
      console.warn('Hero photo missing, trying next set:', set.before, set.after);
    }
    console.warn(`No complete hero photo set found for "${key}". Showing the fallback animation.`);
  };
  loadPhotos(); addEventListener('resize', loadPhotos);

  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const wrap = v => ((v % 1) + 1) % 1;

  /* cover-fit an image, with zoom (scale) and sideways pan (-1 left … 1 right) */
  const cover = (im, scale = 1, pan = 0) => {
    const s = Math.max(W / im.naturalWidth, H / im.naturalHeight) * scale;
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, (W - w) / 2 + pan * (w - W) / 2, (H - h) / 2, w, h);
  };

  /* film grain texture (made once) */
  const grain = document.createElement('canvas'); grain.width = grain.height = 192;
  { const g = grain.getContext('2d'), d = g.createImageData(192, 192);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); }
  let grainPat = null;

  /* floating dust specks */
  const dust = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.8, s: .2 + Math.random() * .8, o: Math.random() * 6.283 }));

  const drawPhotos = p => {
    const { intro, before, after } = photos, t = performance.now() / 1000;
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#050605'; ctx.fillRect(0, 0, W, H);

    /* intro: dolly in on the vans while drifting left */
    const introAlpha = 1 - seg(p, .22, .32);
    if (introAlpha > 0) {
      ctx.globalAlpha = introAlpha;
      cover(intro, 1.22 - .14 * ease(seg(p, 0, .32)), .5 - .8 * ease(seg(p, 0, .32)));
    }

    /* walk in: push forward and pan across the space, breathe out at the end */
    const showBefore = seg(p, .22, .32);
    const push = 1.06 + .16 * ease(seg(p, .25, .8)) - .12 * ease(seg(p, .8, 1));
    const pan = -.4 + .8 * ease(seg(p, .22, 1));
    if (showBefore > 0) {
      ctx.globalAlpha = showBefore;
      cover(before, push, pan);

      /* the clear: glowing green line wipes the after photo in */
      const wipe = ease(seg(p, .55, .78));
      if (wipe > 0) {
        const x = W * wipe;
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, x, H); ctx.clip();
        cover(after, push, pan);
        ctx.restore();
        if (wipe < 1) {
          ctx.globalAlpha = 1;
          const g = ctx.createLinearGradient(x - 90 * dpr, 0, x, 0);
          g.addColorStop(0, 'rgba(129,215,66,0)'); g.addColorStop(1, 'rgba(129,215,66,.5)');
          ctx.fillStyle = g; ctx.fillRect(x - 90 * dpr, 0, 90 * dpr, H);
          ctx.fillStyle = '#81d742'; ctx.shadowColor = '#81d742'; ctx.shadowBlur = 28 * dpr;
          ctx.fillRect(x - 1.5 * dpr, 0, 3 * dpr, H);
          ctx.shadowBlur = 0;
        }
      }
    }
    ctx.globalAlpha = 1;

    /* dust hanging in the air, gone once it is clean */
    const dustA = seg(p, .2, .35) * (1 - seg(p, .6, .8));
    if (dustA > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = '#f4f1dc';
      for (const d of dust) {
        const x = wrap(d.x + Math.sin(t * .3 + d.o) * .02) * W;
        const y = wrap(d.y - t * .012 * d.s) * H;
        ctx.globalAlpha = dustA * (.2 + .4 * Math.sin(t * d.s + d.o) ** 2);
        ctx.beginPath(); ctx.arc(x, y, d.r * dpr, 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }

    /* soft burst of light as the clear finishes */
    const flash = seg(p, .74, .8) * (1 - seg(p, .8, .92));
    if (flash > 0) {
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * .7);
      g.addColorStop(0, `rgba(235,255,215,${.38 * flash})`); g.addColorStop(1, 'rgba(235,255,215,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    /* colour grade: moody green-black shadows */
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(30,60,15,.55)'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    /* darken for readable text, lifting as the space gets clean */
    ctx.fillStyle = `rgba(5,6,5,${.55 - .3 * ease(seg(p, .7, 1))})`; ctx.fillRect(0, 0, W, H);

    /* film grain */
    grainPat = grainPat || ctx.createPattern(grain, 'repeat');
    ctx.save();
    ctx.globalAlpha = .07; ctx.globalCompositeOperation = 'overlay';
    ctx.translate(Math.random() * 192, Math.random() * 192);
    ctx.fillStyle = grainPat; ctx.fillRect(-192, -192, W + 192, H + 192);
    ctx.restore();

    /* widescreen film bars that open as you start scrolling */
    const bar = H * .11 * (1 - ease(seg(p, .02, .3)));
    if (bar > .5) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar); }
  };

  /* 3. procedural fallback (green tunnel) */
  const rnd = (a => () => (a = (a * 16807) % 2147483647) / 2147483647)(7);
  const junk = Array.from({ length: 46 }, () => ({ x: rnd() * 2 - 1, y: rnd() * .9, z: rnd(), w: .05 + rnd() * .12, h: .05 + rnd() * .14, k: rnd(), a: rnd() }));
  const drawProcedural = p => {
    const cx = W / 2, cy = H * .5, clear = clamp((p - .45) / .35), light = clamp((p - .5) / .4);
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * .8);
    bg.addColorStop(0, `rgb(${lerp(14, 205, light)},${lerp(26, 232, light)},${lerp(12, 190, light)})`);
    bg.addColorStop(1, `rgb(${lerp(2, 40, light)},${lerp(4, 56, light)},${lerp(2, 34, light)})`);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const N = 22, travel = p * 9, ink = light > .6 ? '60,120,30' : '129,215,66';
    for (let i = N; i >= 0; i--) {
      const z = ((i - travel % 1) / N), s = Math.pow(1 - z, 3.2) * 1.9 + .02;
      if (z <= 0) continue;
      const w = W * s * .55, h = H * s * .62;
      ctx.strokeStyle = `rgba(${ink},${clamp(.55 - z * .5)})`; ctx.lineWidth = 1 + s * 5 * dpr;
      ctx.shadowColor = `rgba(${ink},.7)`; ctx.shadowBlur = 18 * s * dpr;
      ctx.strokeRect(cx - w / 2, cy - h * .45, w, h);
    }
    ctx.shadowBlur = 0; ctx.strokeStyle = `rgba(${ink},.14)`; ctx.lineWidth = dpr;
    for (let k = -6; k <= 6; k++) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + k * W * .25, H * 1.1); ctx.stroke(); }
    for (const j of junk) {
      const z = ((j.z - p * 2.2) % 1 + 1) % 1, s = Math.pow(1 - z, 2.4); if (s < .02) continue;
      const vis = 1 - clear * (.3 + j.a * .7); if (vis <= .02) continue;
      const x = cx + j.x * W * .6 * s, y = cy + (j.y * .5 - .02) * H * s, w = j.w * W * s, h = j.h * H * s;
      ctx.globalAlpha = clamp(vis * (1 - z * .6)) * (1 - clear * clear);
      ctx.fillStyle = j.k > .66 ? '#2c3328' : j.k > .33 ? '#3a2f25' : '#1e241b'; ctx.fillRect(x - w / 2, y - h, w, h);
      ctx.strokeStyle = `rgba(${ink},.5)`; ctx.lineWidth = dpr; ctx.strokeRect(x - w / 2, y - h, w, h);
    }
    ctx.globalAlpha = 1;
  };

  (function tick() {
    const r = hero.getBoundingClientRect();
    if (r.bottom > 0) {
      const target = clamp(-r.top / (hero.offsetHeight - innerHeight));
      prog = reduce ? target : lerp(prog, target, .09);
            if (!window.HERO3D) useFrames ? drawFrame(prog) : photos ? drawPhotos(prog) : drawProcedural(prog);
      let idx = 0; lines.forEach((l, i) => { if (prog >= +l.dataset.at - .02) idx = i; });
      lines.forEach((l, i) => l.classList.toggle('on', i === idx));
      dots.forEach((d, i) => d.classList.toggle('on', i === idx));
      hint.style.opacity = prog > .04 ? 0 : 1;
    }
    requestAnimationFrame(tick);
  })();
}

/* ---------- chips ---------- */
$$('.chips').forEach(g => g.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (g.classList.contains('single')) $$('button', g).forEach(x => x !== b && x.classList.remove('on'));
  b.classList.toggle('on');
}));

/* ---------- prefill from links like quote.html?type=...&area=... ---------- */
const qs = new URLSearchParams(location.search), preType = qs.get('type'), preArea = qs.get('area');
if (preType) $$('.chips[data-name=waste] button').forEach(b => b.classList.toggle('on', b.textContent === preType));
if (preArea) {
  const n = $('textarea[name=notes]'); if (n && !n.value) n.value = `Area: ${preArea}\n`;
  const pc = $('input[name=postcode]'); if (pc) pc.placeholder = `Your postcode in ${preArea}`;
}

/* ---------- forms ---------- */
$$('form[data-form]').forEach(f => {
  let photos = [];
  const drop = $('.drop', f), file = $('input[type=file]', f), thumbs = $('.thumbs', f), err = $('.err', f);
  if (drop) {
    const add = fl => [...fl].filter(x => x.type.startsWith('image/')).slice(0, 10 - photos.length).forEach(x => {
      photos.push(x); const im = new Image(); im.src = URL.createObjectURL(x); im.alt = ''; thumbs.appendChild(im);
    });
    drop.addEventListener('click', () => file.click());
    drop.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), file.click()));
    file.addEventListener('change', () => add(file.files));
    ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => add(e.dataTransfer.files));
  }
  f.addEventListener('submit', async e => {
    e.preventDefault();
    if (f.company && f.company.value) return; // spam honeypot
    let ok = true;
    $$('[required]', f).forEach(i => {
      const bad = !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value));
      i.classList.toggle('bad', bad); if (bad) ok = false;
    });
    err.textContent = ok ? '' : 'Please fill in the highlighted fields.';
    if (!ok) { $('.bad', f).focus(); return; }
    const data = new FormData(f); data.delete('company'); data.delete('photo-input');
    data.append('form', f.dataset.form); data.append('page', location.pathname);
    $$('.chips', f).forEach(g => g.dataset.name && data.append(g.dataset.name, $$('.on', g).map(b => b.textContent).join(', ')));
    photos.forEach(p => data.append('photos', p));
    const btn = $('button[type=submit]', f), txt = btn.textContent; btn.disabled = true; btn.textContent = 'Sending...';
    try {
      if (FORM_ENDPOINT) {
        const r = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error(r.status);
      } else {
        const body = [...data.entries()].filter(([, v]) => typeof v === 'string' && v).map(([k, v]) => `${k}: ${v}`).join('\n')
          + (photos.length ? `\n\n(${photos.length} photo(s) to attach)` : '');
        location.href = `mailto:${SITE.email}?subject=${encodeURIComponent('Website enquiry')}&body=${encodeURIComponent(body)}`;
      }
      f.classList.add('sent');
      window.gtag && gtag('event', 'generate_lead', { form_name: f.dataset.form });
    } catch (x) {
      err.textContent = `Sorry, that did not send. Please call us on ${SITE.phone}.`;
    } finally { btn.disabled = false; btn.textContent = txt; }
  });
});

/* ---------- gallery lightbox ---------- */
const gal = $$('.gallery .ph, .community .ph');
if (gal.length) {
  const lb = document.createElement('div'); lb.className = 'lb'; lb.innerHTML = '<img alt="">'; document.body.appendChild(lb);
  const big = $('img', lb), close = () => lb.classList.remove('on');
  gal.forEach(p => p.addEventListener('click', () => { const i = $('img', p); if (!i) return; big.src = i.src; big.alt = i.alt; lb.classList.add('on'); }));
  lb.addEventListener('click', close); addEventListener('keydown', e => e.key === 'Escape' && close());
}

/* ---------- conversion tracking ---------- */
$$('a[href^="tel:"]').forEach(a => a.addEventListener('click', () => window.gtag && gtag('event', 'phone_click', { number: a.href })));
})();