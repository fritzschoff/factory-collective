'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { postApi, submitOnce } from '@/lib/api';
import { useHydrated } from '@/lib/use-hydrated';

const SUBJECTS = [
  ['general', 'General'], ['order', 'An order'], ['original', 'An original'], ['fitting', 'A fitting'],
  ['studio', 'Studio visit'], ['press', 'Press'], ['wholesale', 'Wholesale'], ['notify', 'Notify me when it exists'],
] as const;

/** ?subject=notify-furniture preselects "Notify me …" and keeps the full subject for the message. */
export function subjectFromQuery(q: string | null): { key: string; full: string } {
  const full = q ?? '';
  const key = full.split('-')[0];
  return { key: SUBJECTS.some(([k]) => k === key) ? key : 'general', full };
}

const SubjectSelect = ({ subject }: { subject: string }) => (
  <select name="subject" defaultValue={subject}>{SUBJECTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
);

/** The subject from the address, and the full subject as `work` for the message. */
function SubjectFromQuery() {
  const { key, full } = subjectFromQuery(useSearchParams().get('subject'));
  return (
    <>
      {/* keyed by the query: a "Notify me" link followed on this page preselects its subject too */}
      <SubjectSelect key={full} subject={key} />
      <input type="hidden" name="work" value={full} />
    </>
  );
}

/** The contact form — also the target of every "Notify me". */
export function ContactForm() {
  const hydrated = useHydrated();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false); // a request is on its way: further submits are ignored
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    if (!form.checkValidity()) { setMsg('Please enter your name, a valid e-mail address and a few words.'); return; }
    setMsg('Sending …');
    setBusy(true);
    try {
      await submitOnce('enquire', (idempotencyKey) => postApi('enquire', Object.fromEntries(new FormData(form)), { idempotencyKey }));
      setMsg('Thank you. We write back within two working days.');
      form.reset();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="cform" noValidate aria-busy={busy} onSubmit={onSubmit}>
      <label>Name<input name="name" required autoComplete="name" /></label>
      <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
      {/* Only the subject reads the address, so only it waits for it, in a boundary far under 500 bytes (Ruling P34):
          the rest of the form is in the server HTML. */}
      <label>Subject<Suspense fallback={<><SubjectSelect subject="general" /><input type="hidden" name="work" value="" /></>}><SubjectFromQuery /></Suspense></label>
      <label>Message<textarea name="message" rows={6} required /></label>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <button className="pill" type="submit" disabled={busy || !hydrated}>Send</button>
      <p className="dlg__msg" role="status">{msg}</p>
    </form>
  );
}
