'use client';

import { useState, type FormEvent } from 'react';
import { postApi } from '@/lib/api';
import { useHydrated } from '@/lib/use-hydrated';

export function NewsletterForm() {
  const hydrated = useHydrated();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false); // a request is on its way: further submits are ignored
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    if (!form.checkValidity()) { setMsg('Please enter a valid e-mail address.'); return; }
    setMsg('…');
    setBusy(true);
    try {
      await postApi('newsletter', Object.fromEntries(new FormData(form)));
      setMsg('Subscribed. One letter a month.');
      form.reset();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="nl" noValidate aria-busy={busy} onSubmit={onSubmit}>
      <label className="sr" htmlFor="nl-mail">E-mail</label>
      <input id="nl-mail" name="email" type="email" required placeholder="E-mail" autoComplete="email" />
      <button type="submit" disabled={busy || !hydrated}>( Subscribe )</button>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <p className="nl__msg" role="status">{msg}</p>
    </form>
  );
}
