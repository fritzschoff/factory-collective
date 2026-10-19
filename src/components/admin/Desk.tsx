'use client';

import { useEffect, useState } from 'react';
import { PRODUCT_GROUPS, expandVariants, skuFor, type ProductKind, type ProductSave, type ShopImage, type ShopProduct } from '@cfc/shop-core';
import { adminCall, adminError } from '@/components/admin/api';

type Section = 'products' | 'stock' | 'orders' | 'enquiries' | 'newsletter';

const HREF: Record<ProductKind, string> = {
  fashion: '/atelier/fashion/',
  bag: '/atelier/bags/',
  jewellery: '/atelier/jewellery/',
  scan: '/atelier/scan-series/',
  print: '/studio/',
};

function blank(): ProductSave {
  return {
    id: '', kind: 'fashion', group: 'jackets', code: '', slug: '', name: '', material: '', sub: '', description: '',
    spec: [], accordions: [], note: '', lead: '', dims: '', inv: '', tag: '', priceCents: null, options: [], images: [],
    status: 'draft', href: '/atelier/fashion/', variantPrices: {}, stock: {},
  };
}

function fromShop(product: ShopProduct, stock: Record<string, number | null>): ProductSave {
  const variantPrices: Record<string, number | null> = {};
  for (const variant of product.variants) variantPrices[variant.key] = variant.priceCents;
  return {
    id: product.id, kind: product.kind, group: product.group, code: product.code, slug: product.slug, name: product.name,
    material: product.material, sub: product.sub ?? '', description: product.description, spec: product.spec,
    accordions: product.accordions, note: product.note, lead: product.lead, dims: product.dims ?? '', inv: product.inv,
    tag: product.tag ?? '', priceCents: product.priceCents, options: product.options, status: product.status,
    href: product.href, images: product.images ?? [], ground: product.ground, pos: product.pos, updatedAt: product.updatedAt, variantPrices, stock,
  };
}

export function Desk({ section }: { section: Section }) {
  if (section === 'products') return <Products />;
  if (section === 'stock') return <Stock />;
  if (section === 'orders') return <Orders />;
  if (section === 'enquiries') return <Enquiries />;
  return <Newsletter />;
}

function Products() {
  const [rows, setRows] = useState<{ id: string; code: string; name: string; kind: string; group: string; status: string }[]>([]);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<ProductSave | null>(null);
  const [notice, setNotice] = useState('');

  const load = () => {
    adminCall<{ products: typeof rows }>('adminListProducts').then((data) => setRows(data.products)).catch((error) => setNotice(adminError(error).message));
  };
  useEffect(load, []);

  const open = async (id: string) => {
    const data = await adminCall<{ product: ShopProduct | null; stock: Record<string, number | null> }>('adminGetProduct', { id });
    if (data.product) setEditing(fromShop(data.product, data.stock));
  };

  const shown = rows.filter((row) => {
    const hay = `${row.code} ${row.name} ${row.id}`.toLowerCase();
    if (query && !hay.includes(query.toLowerCase())) return false;
    if (kind && row.kind !== kind) return false;
    if (status && row.status !== status) return false;
    return true;
  });

  if (editing) return <ProductForm value={editing} onClose={() => { setEditing(null); load(); }} />;

  return (
    <section>
      <div className="ad__bar" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="Suche" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Suche" />
        <select aria-label="Art" value={kind} onChange={(event) => setKind(event.target.value)}>
          <option value="">Alle Arten</option>
          {Object.keys(PRODUCT_GROUPS).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Alle Status</option>
          <option value="draft">Entwurf</option>
          <option value="active">Aktiv</option>
          <option value="archived">Archiv</option>
        </select>
        <button type="button" className="ad__solid" onClick={() => setEditing(blank())}>Neu</button>
      </div>
      <p className="ad__msg" role="status">{notice}</p>
      <table className="ad__table">
        <thead><tr><th>Code</th><th>Name</th><th>Status</th></tr></thead>
        <tbody>
          {shown.map((row) => (
            <tr key={row.id}>
              <td><button type="button" onClick={() => void open(row.id)}>{row.code}</button></td>
              <td>{row.name}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ProductForm({ value, onClose }: { value: ProductSave; onClose: () => void }) {
  const [form, setForm] = useState(value);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof ProductSave>(key: K, next: ProductSave[K]) => setForm((prev) => ({ ...prev, [key]: next }));
  const variants = expandVariants(form.options);

  const save = async (copy = false) => {
    setBusy(true);
    setNotice('');
    setFields({});
    const body = copy ? { ...form, id: `${form.id}-2`, slug: `${form.slug}-2`, status: 'draft' as const, updatedAt: undefined } : form;
    try {
      const result = await adminCall<{ updatedAt: string }>('adminSaveProduct', body);
      setForm({ ...body, updatedAt: result.updatedAt });
      setNotice(copy ? 'Kopie gespeichert.' : 'Gespeichert. Die Seite holt das spätestens in einer Minute.');
    } catch (error) {
      const parsed = adminError(error);
      setNotice(parsed.message);
      setFields(parsed.fields);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <div className="ad__bar" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={onClose}>Zurück</button>
        <button type="submit" className="ad__solid" disabled={busy}>Speichern</button>
        {form.updatedAt && <button type="button" disabled={busy} onClick={() => void save(true)}>Duplizieren</button>}
      </div>
      <p className="ad__msg" role="status">{notice}</p>
      <div className="ad__split">
        <div>
          <div className="ad__grid">
            <label>Kennung<input value={form.id} disabled={Boolean(form.updatedAt)} onChange={(event) => set('id', event.target.value)} />{fields.id && <span className="ad__msg">{fields.id}</span>}</label>
            <label>Code<input value={form.code} onChange={(event) => set('code', event.target.value)} />{fields.code && <span className="ad__msg">{fields.code}</span>}</label>
            <label>Name<input value={form.name} onChange={(event) => set('name', event.target.value)} />{fields.name && <span className="ad__msg">{fields.name}</span>}</label>
            <label>Slug<input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value, href: `${HREF[prev.kind]}${event.target.value}/` }))} /></label>
            <label>Art<select value={form.kind} onChange={(event) => { const kind = event.target.value as ProductKind; setForm((prev) => ({ ...prev, kind, group: PRODUCT_GROUPS[kind][0], href: `${HREF[kind]}${prev.slug}/` })); }}>{Object.keys(PRODUCT_GROUPS).map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Bereich<select value={form.group} onChange={(event) => set('group', event.target.value)}>{PRODUCT_GROUPS[form.kind].map((item) => <option key={item}>{item}</option>)}</select>{fields.group && <span className="ad__msg">{fields.group}</span>}</label>
            <label>Status<select value={form.status} onChange={(event) => set('status', event.target.value as ProductSave['status'])}><option value="draft">Entwurf</option><option value="active">Aktiv</option><option value="archived">Archiv</option></select></label>
            <label>Preis in Cent<input value={form.priceCents ?? ''} onChange={(event) => set('priceCents', event.target.value === '' ? null : Number(event.target.value))} /></label>
            <label>Material<input value={form.material} onChange={(event) => set('material', event.target.value)} /></label>
            <label>Lieferzeit<input value={form.lead} onChange={(event) => set('lead', event.target.value)} /></label>
          </div>
          <label>Beschreibung<textarea value={form.description} onChange={(event) => set('description', event.target.value)} /></label>
          <label>Hinweis<textarea value={form.note} onChange={(event) => set('note', event.target.value)} /></label>
          <label className="ad__check"><input type="checkbox" checked={form.ground === true} onChange={(event) => set('ground', event.target.checked)} /> auf Papiergrund</label>
          <Images form={form} onImages={(images) => set('images', images)} onFocus={(focus) => set('pos', focus)} setNotice={setNotice} />
          <p className="micro">Spezifikation</p>
          <div className="ad__rows">
            {form.spec.map((row, index) => (
              <div className="ad__row" key={index}>
                <input aria-label="Spezifikation Bezeichnung" value={row[0]} onChange={(event) => set('spec', form.spec.map((item, i) => i === index ? [event.target.value, item[1]] : item))} />
                <input aria-label="Spezifikation Wert" value={row[1]} onChange={(event) => set('spec', form.spec.map((item, i) => i === index ? [item[0], event.target.value] : item))} />
                <button type="button" onClick={() => set('spec', form.spec.filter((_, i) => i !== index))}>Entfernen</button>
              </div>
            ))}
            <button type="button" onClick={() => set('spec', [...form.spec, ['', '']])}>Zeile</button>
          </div>
          <p className="micro">Akkordeons</p>
          <div className="ad__rows">
            {form.accordions.map((row, index) => (
              <div key={index}>
                <input aria-label="Akkordeon Titel" value={row.title} onChange={(event) => set('accordions', form.accordions.map((item, i) => i === index ? { ...item, title: event.target.value } : item))} />
                <textarea aria-label="Akkordeon Text" value={row.body} onChange={(event) => set('accordions', form.accordions.map((item, i) => i === index ? { ...item, body: event.target.value } : item))} />
              </div>
            ))}
            <button type="button" onClick={() => set('accordions', [...form.accordions, { title: '', body: '' }])}>Akkordeon</button>
          </div>
          <p className="micro">Optionen</p>
          {form.options.map((option, index) => (
            <div key={index} className="ad__rows">
              <div className="ad__grid">
                <label>Options-Id<input value={option.id} onChange={(event) => set('options', form.options.map((item, i) => i === index ? { ...item, id: event.target.value } : item))} /></label>
                <label>Bezeichnung<input value={option.label} onChange={(event) => set('options', form.options.map((item, i) => i === index ? { ...item, label: event.target.value } : item))} /></label>
                <label>Rolle<select value={option.role} onChange={(event) => set('options', form.options.map((item, i) => i === index ? { ...item, role: event.target.value as 'variant' | 'config' } : item))}><option value="variant">Variante</option><option value="config">Konfiguration</option></select></label>
                <label>Typ<select value={option.type} onChange={(event) => set('options', form.options.map((item, i) => i === index ? { ...item, type: event.target.value as ProductSave['options'][number]['type'] } : item))}><option value="swatch">Farbe</option><option value="size">Größe</option><option value="choice">Auswahl</option><option value="text">Text</option></select></label>
              </div>
              {(option.values ?? []).map((entry, valueIndex) => (
                <div className="ad__row" key={valueIndex}>
                  <input aria-label="Wert Id" value={entry.id} onChange={(event) => patchValue(index, valueIndex, { id: event.target.value })} />
                  <input aria-label="Wert Bezeichnung" value={entry.label} onChange={(event) => patchValue(index, valueIndex, { label: event.target.value })} />
                  <button type="button" onClick={() => set('options', form.options.map((item, i) => i === index ? { ...item, values: item.values?.filter((_, j) => j !== valueIndex) } : item))}>Entfernen</button>
                </div>
              ))}
              <button type="button" onClick={() => set('options', form.options.map((item, i) => i === index ? { ...item, values: [...(item.values ?? []), { id: '', label: '' }] } : item))}>Wert</button>
            </div>
          ))}
          <button type="button" onClick={() => set('options', [...form.options, { id: '', label: '', role: 'variant', type: 'choice', values: [] }])}>Option</button>
          <p className="micro">Varianten</p>
          <table className="ad__table">
            <thead><tr><th>Schlüssel</th><th>Preis in Cent</th><th>Bestand</th></tr></thead>
            <tbody>
              {variants.map((variant) => {
                const sku = skuFor(form.id || 'neu', variant.key);
                return (
                  <tr key={variant.key || 'only'}>
                    <td>{variant.key || '—'}</td>
                    <td><input aria-label={`Preis ${variant.key || 'einzeln'}`} value={form.variantPrices[variant.key] ?? ''} onChange={(event) => set('variantPrices', { ...form.variantPrices, [variant.key]: event.target.value === '' ? null : Number(event.target.value) })} /></td>
                    <td><input aria-label={`Bestand ${variant.key || 'einzeln'}`} value={form.stock[sku] ?? ''} placeholder="unbegrenzt" onChange={(event) => set('stock', { ...form.stock, [sku]: event.target.value === '' ? null : Number(event.target.value) })} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <aside className="ad__preview">
          <p className="micro">Vorschau</p>
          <h2>{form.code || 'Code'}{' // '}{form.name || 'Name'}</h2>
          <p>{form.material}</p>
          <p>{form.description}</p>
          <p>{form.priceCents == null ? '€ [price]' : `${(form.priceCents / 100).toFixed(0)} €`}</p>
          <p>{form.lead}</p>
          <p className="ad__ok">{form.status === 'draft' ? 'Entwurf, nicht öffentlich.' : form.status === 'archived' ? 'Archiv, die alte Adresse bleibt.' : 'Aktiv.'}</p>
        </aside>
      </div>
    </form>
  );

  function patchValue(optionIndex: number, valueIndex: number, patch: { id?: string; label?: string }) {
    set('options', form.options.map((item, i) => i === optionIndex ? { ...item, values: item.values?.map((entry, j) => j === valueIndex ? { ...entry, ...patch } : entry) } : item));
  }
}

function Images({ form, onImages, onFocus, setNotice }: { form: ProductSave; onImages: (images: ShopImage[]) => void; onFocus: (focus: string) => void; setNotice: (message: string) => void }) {
  const [uploadError, setUploadError] = useState('');
  const move = (index: number, delta: number) => {
    const next = form.images.slice();
    const [row] = next.splice(index, 1);
    next.splice(index + delta, 0, row);
    onImages(next);
  };
  const upload = async (files: FileList | File[]) => {
    if (!form.id) { setUploadError('Bitte zuerst eine Kennung eintragen.'); return; }
    setUploadError('');
    let images = form.images;
    for (const file of [...files]) {
      try {
        const ticket = await adminCall<{ uploadUrl: string; method: 'PUT' | 'POST'; headers: Record<string, string>; image: ShopImage }>('adminCreateUpload', { productId: form.id, filename: file.name, contentType: file.type });
        const sent = await fetch(ticket.uploadUrl, { method: ticket.method, headers: ticket.headers, body: file });
        if (!sent.ok) throw new Error(`Upload fehlgeschlagen (${sent.status}).`);
        const measured = await measure(file);
        const registered = await adminCall<{ image: ShopImage }>('adminRegisterImage', { image: { ...ticket.image, width: measured.width, height: measured.height, alt: form.name || file.name } });
        images = [...images, registered.image];
        onImages(images);
      } catch (error) {
        const message = adminError(error).message || (error instanceof Error ? error.message : 'Der Upload ist fehlgeschlagen.');
        setUploadError(message);
        setNotice(message);
      }
    }
  };
  return (
    <div>
      <p className="micro">Bilder</p>
      <div className="ad__drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void upload(event.dataTransfer.files); }}>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple aria-label="Bilder hochladen" onChange={(event) => { if (event.target.files) void upload(event.target.files); event.target.value = ''; }} />
        <span> oder hierher ziehen</span>
      </div>
      <p className="ad__msg" role="status">{uploadError}</p>
      <div className="ad__photos">
        {form.images.map((image, index) => (
          <figure className="ad__photo" key={image.path || index}>
            {image.url && (
              // eslint-disable-next-line @next/next/no-img-element -- the raw upload (blob or emulator URL), shown to the admin only
              <img src={image.url} alt="" style={{ objectPosition: image.focus ?? '50% 50%' }} onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
              const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
              const focus = `${x}% ${y}%`;
              onImages(form.images.map((item, i) => i === index ? { ...item, focus } : item));
              if (index === 0) onFocus(focus);
            }} />
            )}
            <input aria-label="Alt-Text" value={image.alt} onChange={(event) => onImages(form.images.map((item, i) => i === index ? { ...item, alt: event.target.value } : item))} />
            <div>
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)}>Nach vorn</button>
              <button type="button" disabled={index === form.images.length - 1} onClick={() => move(index, 1)}>Nach hinten</button>
              <button type="button" onClick={() => onImages(form.images.filter((_, i) => i !== index))}>Entfernen</button>
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}

async function measure(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

function Stock() {
  const [items, setItems] = useState<{ sku: string; code: string; onHand: number | null; reserved: number; available: number | null }[]>([]);
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState('');
  const load = () => { adminCall<{ items: typeof items }>('adminListStock').then((data) => setItems(data.items)).catch((error) => setNotice(adminError(error).message)); };
  useEffect(load, []);
  const shown = items.filter((item) => {
    if (filter === 'low') return item.available != null && item.available > 0 && item.available <= 3;
    if (filter === 'out') return item.available != null && item.available <= 0;
    return true;
  });
  return (
    <section>
      <select aria-label="Bestandsfilter" value={filter} onChange={(event) => setFilter(event.target.value)}>
        <option value="">Alle</option>
        <option value="low">Knapp</option>
        <option value="out">Ausverkauft</option>
      </select>
      <p className="ad__msg" role="status">{notice}</p>
      <table className="ad__table">
        <thead><tr><th>SKU</th><th>Code</th><th>Bestand</th><th>Reserviert</th><th>Verfügbar</th></tr></thead>
        <tbody>
          {shown.map((item) => (
            <tr key={item.sku}>
              <td>{item.sku}</td>
              <td>{item.code}</td>
              <td><input aria-label={`Bestand ${item.sku}`} defaultValue={item.onHand ?? ''} placeholder="unbegrenzt" onBlur={(event) => {
                const raw = event.target.value.trim();
                const onHand = raw === '' ? null : Number(raw);
                adminCall('adminSetOnHand', { sku: item.sku, onHand }).then(load).catch((error) => setNotice(adminError(error).message));
              }} /></td>
              <td>{item.reserved}</td>
              <td>{item.available ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Orders() {
  const [orders, setOrders] = useState<{ id: string; number: number; status: string; email: string }[]>([]);
  const [current, setCurrent] = useState<(Record<string, unknown> & { id: string }) | null>(null);
  const [notice, setNotice] = useState('');
  const load = () => { adminCall<{ orders: typeof orders }>('adminListOrders').then((data) => setOrders(data.orders)).catch((error) => setNotice(adminError(error).message)); };
  useEffect(load, []);
  const open = async (id: string) => {
    const data = await adminCall<{ order: Record<string, unknown> & { id: string } | null }>('adminGetOrder', { id });
    setCurrent(data.order);
  };
  const save = async (status: string, restock: boolean) => {
    if (!current) return;
    try {
      await adminCall('adminUpdateOrder', { id: current.id, status, tracking: current.tracking ?? '', note: current.note ?? '', restock });
      setCurrent({ ...current, status });
      setNotice('Bestellung gespeichert.');
      load();
    } catch (error) {
      setNotice(adminError(error).message);
    }
  };
  if (current) {
    const items = (current.items ?? []) as { qty: number; code: string; name: string }[];
    return (
      <section>
        <button type="button" onClick={() => setCurrent(null)}>Zurück</button>
        <h2>Bestellung {String(current.number ?? '')}</h2>
        <p>{String(current.email ?? '')}</p>
        {items.map((item, index) => <p key={index}>{item.qty} × {item.code}{' // '}{item.name}</p>)}
        <label>Status<select value={String(current.status ?? '')} onChange={(event) => setCurrent({ ...current, status: event.target.value })}><option>paid</option><option>in_progress</option><option>shipped</option><option>done</option><option>awaiting_payment</option><option>cancelled</option></select></label>
        <label>Sendungsnummer<input value={String(current.tracking ?? '')} onChange={(event) => setCurrent({ ...current, tracking: event.target.value })} /></label>
        <label>Notiz<textarea value={String(current.note ?? '')} onChange={(event) => setCurrent({ ...current, note: event.target.value })} /></label>
        <div className="ad__bar" style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="ad__solid" onClick={() => void save(String(current.status ?? 'paid'), false)}>Speichern</button>
          <button type="button" onClick={() => void save('cancelled', true)}>Stornieren und Bestand zurückbuchen</button>
        </div>
        <p className="ad__msg" role="status">{notice}</p>
      </section>
    );
  }
  return (
    <section>
      <p className="ad__msg">{notice}</p>
      <table className="ad__table">
        <thead><tr><th>Nr.</th><th>Status</th><th>E-Mail</th></tr></thead>
        <tbody>{orders.map((order) => <tr key={order.id}><td><button type="button" onClick={() => void open(order.id)}>{order.number}</button></td><td>{order.status}</td><td>{order.email}</td></tr>)}</tbody>
      </table>
    </section>
  );
}

function Enquiries() {
  const [rows, setRows] = useState<{ id: string; name: string; email: string; subject: string; spam: boolean }[]>([]);
  useEffect(() => { adminCall<{ enquiries: typeof rows }>('adminListEnquiries').then((data) => setRows(data.enquiries)).catch(() => setRows([])); }, []);
  return (
    <table className="ad__table">
      <thead><tr><th>Name</th><th>E-Mail</th><th>Betreff</th><th>Spam</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id}><td>{row.name}</td><td>{row.email}</td><td>{row.subject}</td><td>{row.spam ? 'ja' : ''}</td></tr>)}</tbody>
    </table>
  );
}

function Newsletter() {
  const [rows, setRows] = useState<{ id: string; email: string; spam: boolean }[]>([]);
  useEffect(() => { adminCall<{ entries: typeof rows }>('adminListNewsletter').then((data) => setRows(data.entries)).catch(() => setRows([])); }, []);
  const csv = () => {
    const lines = ['email', ...rows.filter((row) => !row.spam).map((row) => row.email)];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'newsletter.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section>
      <button type="button" className="ad__solid" onClick={csv}>CSV</button>
      <table className="ad__table">
        <thead><tr><th>E-Mail</th><th>Spam</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id}><td>{row.email}</td><td>{row.spam ? 'ja' : ''}</td></tr>)}</tbody>
      </table>
    </section>
  );
}
