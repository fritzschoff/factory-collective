'use client';

import { useState, type FormEvent } from 'react';
import { postApi } from '@/lib/api';

export function NewsletterForm() {
  const [msg, setMsg] = useState('');
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { setMsg('Please enter a valid e-mail address.'); return; }
    setMsg('…');
    try {
      await postApi('newsletter', Object.fromEntries(new FormData(form)));
      setMsg('Subscribed. One letter a month.');
      form.reset();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };
  return (
    <form className="nl" noValidate onSubmit={onSubmit}>
      <label className="sr" htmlFor="nl-mail">E-mail</label>
      <input id="nl-mail" name="email" type="email" required placeholder="E-mail" autoComplete="email" />
      <button type="submit">( Subscribe )</button>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <p className="nl__msg" role="status">{msg}</p>
    </form>
  );
}
