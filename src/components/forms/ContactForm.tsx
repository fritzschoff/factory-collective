'use client';

import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { postApi } from '@/lib/api';

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

/** The contact form — also the target of every "Notify me". */
export function ContactForm() {
  const { key, full } = subjectFromQuery(useSearchParams().get('subject'));
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
      await postApi('enquire', { ...Object.fromEntries(new FormData(form)), work: full });
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
      {/* keyed by the query: a "Notify me" link followed on this page preselects its subject too */}
      <label>Subject<select key={full} name="subject" defaultValue={key}>{SUBJECTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      <label>Message<textarea name="message" rows={6} required /></label>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <button className="pill" type="submit" disabled={busy}>Send</button>
      <p className="dlg__msg" role="status">{msg}</p>
    </form>
  );
}
