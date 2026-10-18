import { Suspense } from 'react';
import { FooterSheet } from '@/components/footer/FooterSheet';
import { NewsletterForm } from '@/components/footer/NewsletterForm';
import { A } from '@/components/link';
import { buildDate } from '@/components/quiet';
import { Soon } from '@/components/soon';
import { FOOTER, type NavEntry } from '@/content/nav';
import { SITE } from '@/content/site';
import { hasRealPictures, imageMode } from '@/lib/images';

function Column({ title, items }: { title: string; items: NavEntry[] }) {
  return (
    <div className="ft__c">
      <h2>{title}</h2>
      <ul>
        {items.map((l, i) => (
          <li key={i}>{'soon' in l ? <Soon k={l.soon} /> : <A href={l.href} {...(l.href.startsWith('http') ? { rel: 'noopener', target: '_blank' } : {})}>{l.label}</A>}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The foot of every public page. FooterSheet reads the address, which under cacheComponents suspends on a route whose
 * params are not known at build time: it waits in a boundary of its own, holding one span, far under 500 bytes. The
 * footer itself stays outside any boundary (see ChromeProvider).
 */
export function Footer({ sheets }: { sheets: Record<string, string> }) {
  const year = (process.env.NEXT_PUBLIC_BUILD_DATE ?? '').slice(0, 4);
  const notes = [process.env.DEMO_PRICES === '1' && 'demo prices', imageMode() === 'local' && !hasRealPictures() && 'sample pictures'].filter(Boolean);
  return (
    <footer className="ft" id="newsletter">
      <div className="ft__grid">
        <Column title="Client services" items={FOOTER.service} />
        <Column title="Company" items={FOOTER.company} />
        <Column title="Follow" items={FOOTER.follow} />
        <div className="ft__c ft__news"><h2>Newsletter</h2><p>New pieces, once a month.</p><NewsletterForm /></div>
      </div>
      <div className="ft__base">
        <div className="legend" aria-label="Legend">
          <span><i className="lg lg--solid" /> shown</span><span><i className="lg lg--hidden" /> Cf. — elsewhere</span><span><i className="lg lg--axis" /> axis</span><span className="r"><i className="lg lg--poss" /> coming</span><span><i className="lg lg--dot" /> other level</span>
        </div>
        <div className="tb" role="group" aria-label="Sheet">
          <div><span>{SITE.name}</span><span>{buildDate()}</span></div>
          <div><Suspense fallback={<span />}><FooterSheet sheets={sheets} /></Suspense><span>English</span></div>
        </div>
      </div>
      <p className="ft__c2">© {year} {SITE.name}{notes.map((n) => ` · ${n}`).join('')}</p>
    </footer>
  );
}
