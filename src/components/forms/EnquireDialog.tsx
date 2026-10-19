'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useChrome } from '@/components/chrome/ChromeProvider';
import { postApi, submitOnce } from '@/lib/api';

function EnquireForm({ what, onClose }: { what: string; onClose: () => void }) {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false); // a request is on its way: further submits are ignored
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    if (!form.checkValidity()) { setMsg('Please enter your name and a valid e-mail address.'); return; }
    setMsg('Sending …');
    setBusy(true);
    try {
      await submitOnce('enquire-dialog', (idempotencyKey) => postApi('enquire', { ...Object.fromEntries(new FormData(form)), work: what, subject: 'original' }, { idempotencyKey }));
      setMsg('Thank you. We write back within two working days.');
      form.reset();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="dlg__f" noValidate aria-busy={busy} onSubmit={onSubmit}>
      <div className="dlg__top"><h2 id="enq-t" className="dlg__t">Enquire</h2><button type="button" onClick={onClose}>( Close )</button></div>
      <p className="dlg__sub">{what}</p>
      <label>Name<input name="name" required autoComplete="name" /></label>
      <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
      <label>Message<textarea name="message" rows={4} placeholder="Where would it hang? Do you want to see it in person?" /></label>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <button className="pill" type="submit" disabled={busy}>Send enquiry</button>
      <p className="dlg__msg" role="status">{msg}</p>
    </form>
  );
}

/** One <dialog> for every "Enquire" button on the site. */
export function EnquireDialog() {
  const { enquiry, closeEnquiry } = useChrome();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (enquiry.open && !d.open) d.showModal();
    if (!enquiry.open && d.open) d.close();
  }, [enquiry.open]);
  return (
    <dialog ref={ref} className="dlg" aria-labelledby="enq-t" onClose={closeEnquiry} onClick={(e) => { if (e.target === ref.current) closeEnquiry(); }}>
      <EnquireForm key={enquiry.n} what={enquiry.what} onClose={closeEnquiry} />
    </dialog>
  );
}
