/* ===== Lord of the Bins: interactive tools =====
   Load estimator, area checker, live open/closed badge. */
(() => {
'use strict';
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const track = (name, params) => window.gtag && gtag('event', name, params || {});
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ================= SETTINGS (edit these) ================= */
const PHONE = '01273 978 967';
/* Opening hours, UK time */
const HOURS = { Mon: [9, 19], Tue: [9, 19], Wed: [9, 19], Thu: [9, 19], Fri: [9, 19], Sat: [10, 17], Sun: [10, 17] };
/* Optional guide prices by % of a van. Leave as null until the client confirms prices.
   Example: [[15, 'from £60'], [40, 'from £120'], [70, 'from £180'], [100, 'from £240']] */
const PRICES = null;
/* Items: [name, rough % of a van load, group]. Adjust the numbers with the client. */
const ITEMS = [
  ['Rubbish bags', 2, 'General'], ['Boxes', 2, 'General'], ['TV or monitor', 3, 'General'], ['Rug or carpet', 5, 'General'],
  ['Sofa', 12, 'Furniture'], ['Armchair', 6, 'Furniture'], ['Mattress', 7, 'Furniture'], ['Bed frame', 8, 'Furniture'],
  ['Wardrobe', 12, 'Furniture'], ['Table', 6, 'Furniture'], ['Chairs', 2, 'Furniture'], ['Desk', 7, 'Furniture'],
  ['Fridge or freezer', 8, 'Appliances'], ['Washing machine', 6, 'Appliances'], ['Cooker', 6, 'Appliances'],
  ['Garden waste bags', 6, 'Garden & building'], ['Builders bulk bags', 12, 'Garden & building'],
  ['Timber or fence panels', 6, 'Garden & building'], ['Bikes', 4, 'Garden & building'], ['Shed contents', 20, 'Garden & building']
];
/* Areas covered (from the old website) */
const TOWNS = ['Brighton', 'Hove', 'Burgess Hill', 'Eastbourne', 'Falmer', 'Hangleton', 'Hassocks', 'Haywards Heath', 'Hollingbury', 'Horsham',
  'Lancing', 'Lewes', 'Newhaven', 'Ovingdean', 'Patcham', 'Peacehaven', 'Portslade', 'Saltdean', 'Seaford', 'Shoreham', 'Sompting',
  'Southwick', 'Withdean', 'Woodingdean', 'Worthing'];
/* Postcodes covered: BN (Brighton, Hove, Worthing, Lewes, Eastbourne, Seaford) and RH12–RH17 (Horsham, Burgess Hill, Haywards Heath) */
const POSTCODES = /^(BN\d{1,2}|RH1[2-7])/;

/* ================= LIVE OPEN / CLOSED BADGE ================= */
const ukNow = () => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = t => (parts.find(p => p.type === t) || {}).value;
  return { day: get('weekday'), h: +get('hour') + +get('minute') / 60 };
};
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const openStatus = () => {
  const { day, h } = ukNow(), [o, c] = HOURS[day] || [9, 17];
  if (h >= o && h < c) return { open: true, text: `Open now · until ${c}:00` };
  if (h < o) return { open: false, text: `Closed · opens today at ${o}:00` };
  const next = DAYS[(DAYS.indexOf(day) + 1) % 7];
  return { open: false, text: `Closed · opens tomorrow at ${(HOURS[next] || [9])[0]}:00` };
};
const navCta = $('.nav-cta');
if (navCta && !$('[data-open-status]', navCta)) navCta.insertAdjacentHTML('afterbegin', '<span data-open-status></span>');
const paintStatus = () => {
  const s = openStatus();
  $$('[data-open-status]').forEach(el => {
    el.classList.add('open-pill'); el.classList.toggle('on', s.open);
    el.innerHTML = `<i></i>${s.text}`;
  });
};
paintStatus(); setInterval(paintStatus, 60000);

/* ================= LOAD ESTIMATOR ================= */
const VAN = `<svg class="van" viewBox="0 0 340 170" aria-hidden="true">
  <defs>
    <clipPath id="vanbox"><rect x="14" y="22" width="206" height="98" rx="6"/></clipPath>
    <linearGradient id="vanfill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a6e86a"/><stop offset="1" stop-color="#5cb82a"/></linearGradient>
  </defs>
  <rect x="14" y="22" width="206" height="98" rx="6" fill="#0d120c"/>
  <g clip-path="url(#vanbox)"><rect class="van-fill" x="14" y="22" width="206" height="98" fill="url(#vanfill)"/></g>
  <g stroke="rgba(129,215,66,.35)" stroke-dasharray="4 5"><line x1="65.5" y1="26" x2="65.5" y2="116"/><line x1="117" y1="26" x2="117" y2="116"/><line x1="168.5" y1="26" x2="168.5" y2="116"/></g>
  <rect x="14" y="22" width="206" height="98" rx="6" fill="none" stroke="#81d742" stroke-width="2.5"/>
  <path d="M226 50h50l36 36v34H226z" fill="#0d120c" stroke="#81d742" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M236 60h36l24 24h-60z" fill="#1b2a14" stroke="#81d742" stroke-width="1.5" stroke-linejoin="round"/>
  <rect x="10" y="120" width="306" height="10" rx="3" fill="#81d742"/>
  <circle cx="72" cy="137" r="17" fill="#050605" stroke="#81d742" stroke-width="3"/><circle cx="72" cy="137" r="6" fill="#81d742"/>
  <circle cx="270" cy="137" r="17" fill="#050605" stroke="#81d742" stroke-width="3"/><circle cx="270" cy="137" r="6" fill="#81d742"/>
</svg>`;

const loadLabel = p => p === 0 ? 'Tap items to start'
  : p <= 15 ? 'A few items: a quick, small collection'
  : p <= 35 ? 'About a quarter of a van'
  : p <= 60 ? 'About half a van'
  : p <= 85 ? 'About three quarters of a van'
  : p <= 100 ? 'A full van load'
  : `About ${Math.ceil(p / 100)} van loads. No problem, we plan the right trips`;
const sizeChip = p => p <= 25 ? 'A few items' : p <= 100 ? 'One van load' : 'Multiple loads';
const guidePrice = p => {
  if (!PRICES || !p) return '';
  const hit = PRICES.find(([max]) => p <= max);
  return hit ? `Guide price: ${hit[1]}` : `Guide price: ${PRICES[PRICES.length - 1][1]} per load`;
};

$$('[data-estimator]').forEach(el => {
  const qty = ITEMS.map(() => 0);
  const groups = [...new Set(ITEMS.map(i => i[2]))];
  el.innerHTML = `<div class="est">
    <div class="est-items">${groups.map(g => `<h4>${g}</h4><div class="est-grid">${ITEMS.map((it, i) => it[2] !== g ? '' : `
      <div class="est-item" data-i="${i}"><span>${it[0]}</span>
        <div class="qty"><button type="button" data-d="-1" aria-label="Remove ${it[0]}">−</button><b>0</b><button type="button" data-d="1" aria-label="Add ${it[0]}">+</button></div>
      </div>`).join('')}</div>`).join('')}</div>
    <aside class="est-sum">
      ${VAN}
      <div class="est-pct"><b>0%</b><span>of a van load</span></div>
      <p class="est-label">Tap items to start</p>
      <p class="est-price"></p>
      <ul class="est-list"></ul>
      <a class="btn btn-lg est-go disabled" href="quote.html">Get my exact quote</a>
      <button type="button" class="est-reset">Reset</button>
      <p class="small">Rough guide only. We confirm your price from your photos.</p>
    </aside></div>`;

  const sum = $('.est-sum', el), fill = $('.van-fill', el), go = $('.est-go', el);
  const update = () => {
    const pct = Math.round(qty.reduce((s, q, i) => s + q * ITEMS[i][1], 0));
    fill.style.transform = `scaleX(${Math.min(pct, 100) / 100})`;
    sum.classList.toggle('over', pct > 100);
    $('.est-pct b', el).textContent = pct + '%';
    $('.est-label', el).textContent = loadLabel(pct);
    $('.est-price', el).textContent = guidePrice(pct);
    const picked = ITEMS.map((it, i) => qty[i] ? `${qty[i]}x ${it[0]}` : '').filter(Boolean);
    $('.est-list', el).innerHTML = picked.map(t => `<li>${t}</li>`).join('');
    $$('.est-item', el).forEach(r => { const i = +r.dataset.i; r.classList.toggle('has', qty[i] > 0); $('b', r).textContent = qty[i]; });
    go.classList.toggle('disabled', !pct);
    go.href = pct ? `quote.html?items=${encodeURIComponent(picked.join(', '))}&load=${pct}&size=${encodeURIComponent(sizeChip(pct))}` : 'quote.html';
  };
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-d]');
    if (b) { const i = +b.closest('.est-item').dataset.i; qty[i] = Math.max(0, Math.min(99, qty[i] + +b.dataset.d)); update(); return; }
    if (e.target.closest('.est-reset')) { qty.fill(0); update(); }
  });
  go.addEventListener('click', () => track('estimate_to_quote', { load: $('.est-pct b', el).textContent }));
  update();
});

/* quote page: fill the form from the estimator */
const qs = new URLSearchParams(location.search);
if (qs.get('items')) {
  const notes = $('textarea[name=notes]');
  if (notes) notes.value = `My load: ${qs.get('items')} (about ${qs.get('load')}% of a van)\n` + notes.value;
  const size = qs.get('size');
  if (size) $$('.chips[data-name=size] button').forEach(b => b.classList.toggle('on', b.textContent === size));
  const waste = $('.chips[data-name=waste]');
  if (waste && !$('.on', waste)) { const fb = $$('button', waste).find(b => b.textContent === 'Furniture / bulky'); if (fb) fb.classList.add('on'); }
}

/* ================= AREA CHECKER ================= */
$$('[data-area-check]').forEach(el => {
  el.innerHTML = `<form class="area-check" novalidate>
      <label>Your town or postcode<input name="where" list="towns-list" autocomplete="postal-code" placeholder="e.g. Hove or BN3 4AB"></label>
      <button class="btn" type="submit">Check</button>
    </form>
    <datalist id="towns-list">${TOWNS.map(t => `<option value="${t}">`).join('')}</datalist>
    <div class="area-res" aria-live="polite"></div>`;
  const input = $('input', el), res = $('.area-res', el);
  const check = final => {
    const v = input.value.trim();
    if (!v) { res.innerHTML = ''; return; }
    const lower = v.toLowerCase(), pc = v.toUpperCase().replace(/\s+/g, '');
    const town = TOWNS.find(t => t.toLowerCase() === lower) || (v.length > 2 && TOWNS.find(t => t.toLowerCase().startsWith(lower)));
    if (town || POSTCODES.test(pc)) {
      const place = town || v.toUpperCase();
      res.innerHTML = `<div class="res ok"><span><b>Yes, we cover ${esc(place)}.</b> Same-day clearance is often available.</span>
        <a class="btn btn-sm" href="quote.html?area=${encodeURIComponent(place)}">Get a free quote</a></div>`;
      if (final) track('area_check', { result: 'yes', area: place });
    } else if (final || v.length > 3) {
      res.innerHTML = `<div class="res maybe"><span><b>${esc(v)} isn't on our usual list</b>, but we often travel further across the South East. Give us a quick call to check.</span>
        <a class="btn btn-sm btn-ghost" href="tel:${PHONE.replace(/\s/g, '')}">Call ${PHONE}</a></div>`;
      if (final) track('area_check', { result: 'maybe', area: v });
    } else res.innerHTML = '';
  };
  input.addEventListener('input', () => check(false));
  $('form', el).addEventListener('submit', e => { e.preventDefault(); check(true); });
});
})();