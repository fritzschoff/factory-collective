/* Client behaviour — no framework. Everything degrades: without JS the pages, links and menu links still work. */
type Opt = { v: string; l: string };
type Item = { key: string; id: string; qty: number; opts: Record<string, Opt> };
interface CatOpt { id: string; label: string; type: string; optional: boolean; max: number | null; values: { id: string; label: string; swatch: string | null }[] }
interface CatProduct { id: string; code: string; name: string; sub: string; kind: string; href: string; img: string | null; ground: boolean; pos?: string; cents: number | null; label: string; priceId: string | null; lead: string; options: CatOpt[]; work: { id: string; edition: string } | null }
interface Catalog { currency: string; demo: boolean; products: Record<string, CatProduct> }

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const html = document.documentElement;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const money = (cents: number | null) => (cents == null ? '€ [price]' : '€ ' + (cents / 100).toLocaleString('en-IE', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 }));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const safe = <T>(f: () => T, d: T): T => { try { return f(); } catch { return d; } };

/* ═════════ toast ═════════ */
let toastT: number | undefined;
function toast(html_: string) {
  const t = $('[data-toast]'); if (!t) return;
  t.innerHTML = html_; t.hidden = false; clearTimeout(toastT); toastT = window.setTimeout(() => { t.hidden = true; }, 4200);
}

/* ═════════ catalogue (lazy) ═════════ */
let catP: Promise<Catalog> | null = null;
const catalog = (): Promise<Catalog> => (catP ??= fetch('/catalog.json').then((r) => r.json()));

/* ═════════ the bag ═════════ */
const KEY = 'cfc.bag.v1';
const bag = {
  load(): Item[] { return safe(() => { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; }, [] as Item[]); },
  save(items: Item[]) { safe(() => localStorage.setItem(KEY, JSON.stringify(items)), undefined); bag.paint(); window.dispatchEvent(new CustomEvent('cfc:bag')); },
  count() { return bag.load().reduce((a, i) => a + i.qty, 0); },
  add(id: string, opts: Record<string, Opt>, qty = 1) {
    const items = bag.load();
    const key = id + '|' + Object.keys(opts).sort().map((k) => k + '=' + opts[k].v).join('&');
    const f = items.find((i) => i.key === key);
    if (f) f.qty = Math.min(9, f.qty + qty); else items.push({ key, id, qty, opts });
    bag.save(items);
  },
  set(key: string, qty: number) { const items = bag.load().map((i) => (i.key === key ? { ...i, qty } : i)).filter((i) => i.qty > 0); bag.save(items); },
  clear() { bag.save([]); },
  paint() { const n = String(bag.count()); $$('[data-bag-count], [data-bag-n]').forEach((e) => { e.textContent = n; }); }
};
window.addEventListener('storage', (e) => { if (e.key === KEY) { bag.paint(); window.dispatchEvent(new CustomEvent('cfc:bag')); } });

function added(p: CatProduct) {
  toast(`<span>${esc(p.code)} // ${esc(p.name)} is in your bag.</span><a href="/bag/">View bag&nbsp;&nbsp;→</a>`);
}

/* ═════════ compact bar + sign parallax ═════════ */
(() => {
  const band = $('[data-band]');
  if (band && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => html.classList.toggle('is-compact', !e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(band);
  } else {
    const f = () => html.classList.toggle('is-compact', window.scrollY > (band?.getBoundingClientRect().height ?? 200));
    window.addEventListener('scroll', f, { passive: true }); f();
  }
  const par = $$('[data-par]');
  if (par.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const base = par.map((el) => { const m = /50%\s+([\d.]+)%/.exec(el.style.backgroundPosition || ''); return m ? parseFloat(m[1]) : 40; });
    let raf = 0;
    const on = () => { raf = 0; const y = window.scrollY; par.forEach((el, i) => { el.style.backgroundPosition = `50% ${Math.max(0, Math.min(100, base[i] + y * 0.012))}%`; }); };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(on); }, { passive: true });
  }
})();

/* ═════════ overlay helpers (menu, search) ═════════ */
let lastFocus: HTMLElement | null = null;
function openOverlay(el: HTMLElement, cls: string, focus?: HTMLElement | null) {
  lastFocus = document.activeElement as HTMLElement;
  el.hidden = false; document.body.classList.add('is-locked', cls);
  (focus ?? el.querySelector<HTMLElement>('button, a, input'))?.focus({ preventScroll: true });
}
function closeOverlay(el: HTMLElement, cls: string) {
  el.hidden = true; document.body.classList.remove(cls);
  if (!$('[data-menu]:not([hidden]), [data-search]:not([hidden])')) document.body.classList.remove('is-locked');
  lastFocus?.focus?.({ preventScroll: true });
}
function trap(el: HTMLElement, e: KeyboardEvent) {
  if (e.key !== 'Tab') return;
  const f = $$<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', el).filter((x) => x.offsetParent !== null);
  if (!f.length) return;
  const a = f[0], z = f[f.length - 1];
  if (e.shiftKey && document.activeElement === a) { z.focus(); e.preventDefault(); } else if (!e.shiftKey && document.activeElement === z) { a.focus(); e.preventDefault(); }
}

/* ═════════ menu + the hover window ═════════ */
(() => {
  const menu = $('[data-menu]'); if (!menu) return;
  const panel = $('.menu__panel', menu)!;
  const field = $('.menu__field', menu)!;
  const pic = $('#menu-win .bwin__pic', menu)!;
  const title = $('[data-win-title]', menu)!, cap = $('[data-win-cap]', menu)!;
  let timer = 0, idx = 0, cur = '';
  const show = (urls: string[]) => {
    if (urls.join('|') === cur) return; cur = urls.join('|'); idx = 0; clearInterval(timer);
    pic.innerHTML = urls.map((u, i) => `<span class="bwin__img${i === 0 ? ' is-on' : ''}" style="background-image:url('${u}')"></span>`).join('');
    if (urls.length > 1) timer = window.setInterval(() => {
      const imgs = $$('.bwin__img', pic); imgs[idx]?.classList.remove('is-on'); idx = (idx + 1) % imgs.length; imgs[idx]?.classList.add('is-on');
    }, 1200);
  };
  const hover = (a: HTMLElement) => {
    const w = (a.dataset.win || '').split('|').filter(Boolean); if (!w.length) return;
    const fr = field.getBoundingClientRect(), ar = a.getBoundingClientRect();
    field.style.setProperty('--top', Math.max(0, ar.top - fr.top - 52) + 'px');
    title.textContent = a.dataset.title || ''; cap.textContent = a.dataset.cap || '';
    show(w); panel.classList.add('is-hover');
  };
  $$('[data-win]', menu).forEach((a) => { a.addEventListener('mouseenter', () => hover(a)); a.addEventListener('focus', () => hover(a)); });
  panel.addEventListener('mouseleave', () => { panel.classList.remove('is-hover'); clearInterval(timer); cur = ''; });
  const close = () => { closeOverlay(menu, 'menu-open'); clearInterval(timer); cur = ''; panel.classList.remove('is-hover'); };
  $$('[data-menu-open]').forEach((b) => b.addEventListener('click', () => openOverlay(menu, 'menu-open', $('[data-menu-close]', menu))));
  $$('[data-menu-close]', menu).forEach((b) => b.addEventListener('click', close));
  menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); else trap(menu, e as KeyboardEvent); });
  $$('a', menu).forEach((a) => a.addEventListener('click', () => { if (a.getAttribute('href')?.startsWith('/') && (a as HTMLAnchorElement).pathname === location.pathname) close(); }));
  $$('[data-search-open]', menu).forEach((b) => b.addEventListener('click', close));
})();

/* ═════════ search ═════════ */
(() => {
  const root = $('[data-search]'); if (!root) return;
  const input = $<HTMLInputElement>('[data-search-input]', root)!, out = $('[data-search-results]', root)!, hint = $('[data-search-hint]', root)!;
  let data: any[] | null = null, sel = -1, rows: HTMLAnchorElement[] = [];
  const load = (): Promise<any[]> => (data ? Promise.resolve(data) : fetch('/search.json').then((r) => r.json()).then((d) => (data = d)));
  const norm = (s: string) => s.toLowerCase().replace(/[\s/.\-–—]+/g, ' ').trim();
  const run = async () => {
    const q = norm(input.value); sel = -1;
    if (!q) { out.innerHTML = ''; hint.hidden = false; rows = []; return; }
    hint.hidden = true; const d = await load(); const toks = q.split(' ');
    const hit = d.map((x) => { const hay = norm(`${x.n} ${x.s} ${x.k}`); const hayc = hay.replace(/ /g, ''); return { x, ok: toks.every((t) => hay.includes(t)) || hayc.includes(q.replace(/ /g, '')) }; }).filter((h) => h.ok).map((h) => h.x).slice(0, 40);
    if (!hit.length) { out.innerHTML = '<p class="sres__none">Nothing drawn under that name. ( )</p>'; rows = []; return; }
    const g = new Map<string, any[]>(); hit.forEach((x) => g.set(x.k, [...(g.get(x.k) || []), x]));
    out.innerHTML = [...g].map(([k, list]) => `<section class="sres__g"><h3>${esc(k)}</h3>${list.map((x) => `<a class="sres__a" href="${esc(x.h)}"><span class="sres__t">${x.i ? `<img src="${esc(x.i)}" alt="" loading="lazy">` : ''}</span><span class="sres__n">${esc(x.n)}<br><span class="sres__m">${esc(x.s)}</span></span><span class="sres__m">${x.p ? esc(x.p) : ''}</span></a>`).join('')}</section>`).join('');
    rows = $$<HTMLAnchorElement>('.sres__a', out);
  };
  const open = (q?: string) => { openOverlay(root, 'search-open', input); if (q != null) input.value = q; load(); run(); };
  const close = () => closeOverlay(root, 'search-open');
  $$('[data-search-open]').forEach((b) => b.addEventListener('click', () => open()));
  $$('[data-search-close]', root).forEach((b) => b.addEventListener('click', close));
  $$('[data-q]', root).forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.q || ''; input.focus(); run(); }));
  input.addEventListener('input', run);
  $('form', root)!.addEventListener('submit', (e) => { e.preventDefault(); (rows[Math.max(sel, 0)] || rows[0])?.click(); });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return close();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (!rows.length) return; e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length; rows.forEach((r, i) => r.classList.toggle('is-sel', i === sel)); rows[sel].scrollIntoView({ block: 'nearest' }); return; }
    trap(root, e);
  });
  document.addEventListener('keydown', (e) => { if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !/input|textarea|select/i.test((e.target as HTMLElement).tagName)) { e.preventDefault(); open(); } });
})();

/* ═════════ reading the options of a buy form ═════════ */
function readOpts(form: HTMLElement): { opts: Record<string, Opt>; missing: string | null } {
  const opts: Record<string, Opt> = {}; let missing: string | null = null;
  const names = new Set($$<HTMLInputElement>('input[type=radio][data-opt]', form).map((i) => i.name));
  names.forEach((n) => { const c = $<HTMLInputElement>(`input[type=radio][data-opt][name="${n}"]:checked`, form); if (c) opts[n] = { v: c.value, l: c.dataset.label || c.value }; else missing = n; });
  $$<HTMLInputElement>('input[type=text][data-opt]', form).forEach((t) => { const v = t.value.trim(); if (v) opts[t.dataset.opt!] = { v, l: v.toUpperCase() }; });
  if ((form as HTMLElement).dataset.needsState) {
    const s = $<HTMLInputElement>('[data-state-pick]:checked'); if (s) opts.state = { v: s.value, l: s.dataset.label || s.value }; else missing = 'state';
  }
  return { opts, missing };
}

/* ═════════ product page: gallery, buy form, accordions ═════════ */
(() => {
  $$('[data-gallery]').forEach((g) => {
    const imgs = $$('.gal__i', g), th = $$('[data-thumb]', g), n = $('[data-gal-i]', g);
    const go = (i: number) => { imgs.forEach((im, k) => im.classList.toggle('is-on', k === i)); th.forEach((t, k) => { t.classList.toggle('is-on', k === i); t.setAttribute('aria-selected', String(k === i)); }); if (n) n.textContent = String(i + 1); };
    th.forEach((t, i) => t.addEventListener('click', () => go(i)));
    let x0 = 0; const main = $('.gal__main', g)!;
    main.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40 && imgs.length > 1) { const cur = imgs.findIndex((i) => i.classList.contains('is-on')); go((cur + (dx < 0 ? 1 : -1) + imgs.length) % imgs.length); } }, { passive: true });
  });
  $$('[data-open-acc]').forEach((a) => a.addEventListener('click', (e) => { const d = document.getElementById(a.dataset.openAcc!) as HTMLDetailsElement | null; if (d) { e.preventDefault(); d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }));
  $$<HTMLFormElement>('form[data-buy]').forEach((f) => {
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = $('[data-msg]', f); const btn = $<HTMLButtonElement>('[data-addbtn]', f);
      const { opts, missing } = readOpts(f);
      if (missing) { if (msg) { msg.textContent = missing === 'state' ? 'Choose a state first.' : `Choose: ${missing}.`; msg.classList.add('is-err'); } if (missing === 'state') document.getElementById('states')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      msg?.classList.remove('is-err'); if (msg) msg.textContent = '';
      const cat = await catalog(); const p = cat.products[f.dataset.id!]; if (!p) return;
      bag.add(p.id, opts); added(p);
      if (btn) { const t = btn.textContent; btn.textContent = 'Added  ✓'; btn.disabled = true; await wait(1600); btn.textContent = t; btn.disabled = false; }
    });
  });
})();

/* ═════════ quick add (tiles) ═════════ */
(() => {
  const host = $('[data-qa]'); if (!host) return;
  let openFor: HTMLElement | null = null;
  const close = () => { host.hidden = true; host.innerHTML = ''; openFor = null; };
  document.addEventListener('click', async (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-quickadd]');
    if (!b) { if (openFor && !(e.target as HTMLElement).closest('[data-qa]')) close(); return; }
    e.preventDefault(); e.stopPropagation();
    if (openFor === b) return close();
    const cat = await catalog(); const p = cat.products[b.dataset.quickadd!]; if (!p) return;
    const opts = p.options.filter((o) => o.type !== 'text');
    if (!opts.length) { bag.add(p.id, {}); added(p); return; }
    host.innerHTML = `<div class="qa__h"><b>${esc(p.code)}</b><span>${esc(p.label)}</span></div>` +
      opts.map((o) => `<div class="qa__o"><span>${esc(o.label)}</span><div class="qa__c">${o.values.map((v, i) => `<button type="button" class="chip${i === (o.type === 'size' && o.values.length > 2 ? Math.floor(o.values.length / 2) : 0) ? ' is-on' : ''}" data-o="${esc(o.id)}" data-v="${esc(v.id)}" data-l="${esc(v.label)}">${esc(v.label)}</button>`).join('')}</div></div>`).join('') +
      `<button class="pill" type="button" data-qa-add>Add to bag</button>`;
    host.hidden = false; openFor = b;
    const r = b.getBoundingClientRect(); const w = host.offsetWidth, h = host.offsetHeight;
    host.style.left = Math.max(12, Math.min(window.innerWidth - w - 12, r.right - w)) + 'px';
    host.style.top = (r.bottom + h + 12 > window.innerHeight ? Math.max(12, r.top - h - 8) : r.bottom + 8) + 'px';
    $$('.chip', host).forEach((c) => c.addEventListener('click', () => { $$('.chip', c.parentElement!).forEach((x) => x.classList.remove('is-on')); c.classList.add('is-on'); }));
    $('[data-qa-add]', host)!.addEventListener('click', () => {
      const o: Record<string, Opt> = {}; $$('.qa__o', host).forEach((row) => { const on = $<HTMLElement>('.chip.is-on', row)!; o[on.dataset.o!] = { v: on.dataset.v!, l: on.dataset.l! }; });
      bag.add(p.id, o); added(p); close();
    });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openFor) close(); });
  window.addEventListener('scroll', () => { if (openFor) close(); }, { passive: true });
})();

/* ═════════ enquire dialog, contact, newsletter ═════════ */
async function post(url: string, body: unknown) {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again.');
  return j;
}
const formData = (f: HTMLFormElement) => Object.fromEntries(new FormData(f).entries());
(() => {
  const dlg = $<HTMLDialogElement>('[data-enquire-dlg]');
  if (dlg) {
    const f = $<HTMLFormElement>('[data-enquire-form]', dlg)!, what = $('[data-enquire-what]', dlg)!, msg = $('[data-msg]', dlg)!;
    $$('[data-enquire]').forEach((b) => b.addEventListener('click', () => { (f.elements.namedItem('work') as HTMLInputElement).value = b.dataset.enquireWhat || b.dataset.enquire || ''; what.textContent = b.dataset.enquireWhat || ''; msg.textContent = ''; dlg.showModal?.(); }));
    $$('[data-dlg-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    f.addEventListener('submit', async (e) => {
      e.preventDefault(); msg.textContent = 'Sending …';
      try { await post('/api/enquire', { ...formData(f), subject: 'original' }); msg.textContent = 'Thank you. We write back within two working days.'; f.reset(); }
      catch (err: any) { msg.textContent = err.message; }
    });
  }
  const c = $<HTMLFormElement>('[data-contact]');
  if (c) {
    const sub = new URLSearchParams(location.search).get('subject');
    const sel = $<HTMLSelectElement>('[data-subject]', c); if (sub && sel) { const key = sub.split('-')[0]; if ([...sel.options].some((o) => o.value === key)) sel.value = key; }
    const msg = $('[data-msg]', c)!;
    c.addEventListener('submit', async (e) => {
      e.preventDefault(); msg.textContent = 'Sending …';
      try { await post('/api/enquire', { ...formData(c), work: sub || '' }); msg.textContent = 'Thank you. We write back within two working days.'; c.reset(); }
      catch (err: any) { msg.textContent = err.message; }
    });
  }
  $$<HTMLFormElement>('[data-newsletter]').forEach((f) => {
    const msg = $('[data-msg]', f)!;
    f.addEventListener('submit', async (e) => {
      e.preventDefault(); msg.textContent = '…';
      try { await post('/api/newsletter', formData(f)); msg.textContent = 'Subscribed. One letter a month.'; f.reset(); }
      catch (err: any) { msg.textContent = err.message; }
    });
  });
})();

/* ═════════ the bag page ═════════ */
(() => {
  if (location.pathname.startsWith('/bag/thank-you')) { bag.clear(); return; }
  const root = $('[data-bag-root]'); if (!root) return;
  const list = $('[data-bag-list]', root)!, sum = $('[data-bag-sum]', root)!;
  const msg = $('[data-checkout-msg]', root)!, btn = $<HTMLButtonElement>('[data-checkout]', root)!;
  const render = async () => {
    const items = bag.load(); const cat = await catalog();
    if (!items.length) { list.innerHTML = '<div class="bag__empty"><p>Your bag is empty.</p><a class="pill" href="/atelier/">Go to the Atelier&nbsp;&nbsp;→</a></div>'; sum.hidden = true; return; }
    let total = 0, unpriced = false;
    list.innerHTML = items.map((i) => {
      const p = cat.products[i.id]; if (!p) return '';
      const line = p.cents != null ? p.cents * i.qty : null; if (line == null) unpriced = true; else total += line;
      const o = Object.entries(i.opts).map(([k, v]) => `${esc(p.options.find((x) => x.id === k)?.label ?? (k === 'state' ? 'State' : k))}: ${esc(v.l)}`).join('&nbsp;&nbsp;·&nbsp;&nbsp;');
      return `<article class="bi" data-key="${esc(i.key)}"><a class="bi__img${p.ground ? ' is-ground' : ''}" href="${esc(p.href)}">${p.img ? `<img src="${esc(p.img)}" alt="" style="object-position:${esc(p.pos || '50% 50%')}">` : ''}</a>
        <div class="bi__t"><b>${esc(p.code)}</b> // ${esc(p.name)}<span class="sub">${esc(p.sub)}</span><span class="sub">${o}</span>
        <span class="bi__q"><button type="button" data-q="-1" aria-label="One less">–</button><span>${i.qty}</span><button type="button" data-q="1" aria-label="One more">+</button></span><button type="button" class="bi__rm" data-rm>Remove</button></div>
        <div class="bi__p">${money(line)}<small>${esc(p.lead)}</small></div></article>`;
    }).join('');
    sum.hidden = false;
    $('[data-sum-sub]', root)!.textContent = unpriced ? '€ [price]' : money(total); $('[data-sum-total]', root)!.textContent = unpriced ? '€ [price]' : money(total);
    btn.disabled = false;
  };
  list.addEventListener('click', (e) => {
    const art = (e.target as HTMLElement).closest<HTMLElement>('.bi'); if (!art) return; const key = art.dataset.key!;
    const q = (e.target as HTMLElement).closest<HTMLElement>('[data-q]'); const it = bag.load().find((x) => x.key === key)!;
    if (q) bag.set(key, Math.max(0, Math.min(9, it.qty + Number(q.dataset.q)))); else if ((e.target as HTMLElement).closest('[data-rm]')) bag.set(key, 0);
  });
  window.addEventListener('cfc:bag', render);
  btn.addEventListener('click', async () => {
    msg.textContent = ''; btn.disabled = true; const t = btn.textContent; btn.textContent = 'One moment …';
    try {
      const r = await post('/api/checkout', { items: bag.load().map((i) => ({ id: i.id, qty: i.qty, opts: Object.fromEntries(Object.entries(i.opts).map(([k, v]) => [k, v.l])) })) });
      location.href = r.url;
    } catch (err: any) { msg.textContent = err.message; btn.disabled = false; btn.textContent = t; }
  });
  render();
})();

/* ═════════ fashion filter ═════════ */
(() => {
  const root = $('[data-filter-root]'); if (!root) return;
  const btns = $$('[data-filter]', root), grp = $$('[data-group]', root);
  const apply = (f: string) => { btns.forEach((b) => b.classList.toggle('is-on', b.dataset.filter === f)); grp.forEach((g) => { g.hidden = f !== 'all' && g.dataset.group !== f; }); };
  btns.forEach((b) => b.addEventListener('click', () => { apply(b.dataset.filter!); history.replaceState(null, '', b.dataset.filter === 'all' ? location.pathname : '#' + b.dataset.filter); }));
  const h = location.hash.slice(1); if (h && grp.some((g) => g.dataset.group === h)) { /* anchors from the menu scroll to the group; keep all visible */ }
})();

bag.paint();
