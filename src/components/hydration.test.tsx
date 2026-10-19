// @vitest-environment jsdom
import { within } from '@testing-library/react';
import { act, type ReactElement } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChromeProvider } from '@/components/chrome/ChromeProvider';
import { PRODUCTS } from '@/content/catalog';
import { toSummary } from '@/lib/products/summary';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
import { NewsletterForm } from './footer/NewsletterForm';
import { ContactForm } from './forms/ContactForm';
import { BuyForm } from './shop/BuyForm';
import { EditionAdd, WorkStateProvider } from './shop/WorkState';

const summary = (id: string) => toSummary({ ...PRODUCTS.find((p) => p.id === id)!, priceCents: 1000 });

const FORMS: { name: string; button: string; ui: () => ReactElement }[] = [
  { name: 'BuyForm', button: 'Add to bag', ui: () => <ChromeProvider><BuyForm product={summary('SH-001')} note="" /></ChromeProvider> },
  { name: 'EditionAdd', button: 'Choose a state · Add', ui: () => <ChromeProvider><WorkStateProvider initial="2"><EditionAdd product={summary('LP-02.A')} needsState /></WorkStateProvider></ChromeProvider> },
  { name: 'NewsletterForm', button: '( Subscribe )', ui: () => <NewsletterForm /> },
  { name: 'ContactForm', button: 'Send', ui: () => <ContactForm /> },
];

let root: Root | undefined;
let container: HTMLElement | undefined;
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = container = undefined;
});

// Before hydration a press would send the form natively (a GET reload with the fields in the address) or do nothing.
describe('before hydration (Ruling P53)', () => {
  it.each(FORMS)('$name: the button is disabled in the server HTML and enabled once the page has hydrated', async ({ button, ui }) => {
    container = document.createElement('div');
    container.innerHTML = renderToString(ui());
    document.body.append(container);
    expect(within(container).getByRole('button', { name: button })).toBeDisabled();
    await act(async () => { root = hydrateRoot(container!, ui()); });
    expect(within(container).getByRole('button', { name: button })).toBeEnabled();
  });
});
