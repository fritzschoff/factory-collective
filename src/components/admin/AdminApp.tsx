'use client';

import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Desk } from '@/components/admin/Desk';
import { firebaseAuth, firebaseConfigured } from '@/lib/firebase-client';

type Screen = 'login' | 'expired' | 'denied' | 'desk';
type Section = 'products' | 'stock' | 'orders' | 'enquiries' | 'newsletter';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'products', label: 'Produkte' },
  { id: 'stock', label: 'Bestand' },
  { id: 'orders', label: 'Bestellungen' },
  { id: 'enquiries', label: 'Anfragen' },
  { id: 'newsletter', label: 'Newsletter' },
];

export function AdminApp() {
  const [screen, setScreen] = useState<Screen>('login');
  const [section, setSection] = useState<Section>('products');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const hadSession = useRef(false);

  useEffect(() => {
    document.documentElement.lang = 'de';
    const auth = firebaseAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setScreen(hadSession.current ? 'expired' : 'login');
        hadSession.current = false;
        return;
      }
      const token = await user.getIdTokenResult();
      if (token.claims.admin !== true) {
        await signOut(auth);
        setNotice('Kein Admin-Zugang.');
        setScreen('denied');
        return;
      }
      hadSession.current = true;
      setScreen('desk');
    });
  }, []);

  const signIn = async () => {
    const auth = firebaseAuth();
    if (!auth) return;
    setBusy(true);
    setNotice('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setNotice('E-Mail oder Passwort stimmt nicht.');
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    const auth = firebaseAuth();
    hadSession.current = false;
    if (auth) await signOut(auth);
    setScreen('login');
  };

  if (!firebaseConfigured()) {
    return (
      <main className="ad">
        <h1>Admin</h1>
        <p className="ad__msg">Firebase ist nicht konfiguriert.</p>
      </main>
    );
  }

  if (screen !== 'desk') {
    return (
      <main className="ad">
        <h1>Anmeldung</h1>
        <form className="ad__login" onSubmit={(event) => { event.preventDefault(); void signIn(); }}>
          <label>E-Mail<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Passwort<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <button className="ad__solid" type="submit" disabled={busy}>Anmelden</button>
          <p className="ad__msg" role="status">{screen === 'expired' ? 'Die Anmeldung ist abgelaufen.' : notice}</p>
        </form>
      </main>
    );
  }

  return (
    <main className="ad">
      <h1>Admin</h1>
      <nav className="ad__nav" aria-label="Admin">
        {SECTIONS.map((item) => (
          <button key={item.id} type="button" className={section === item.id ? 'is-on' : undefined} onClick={() => setSection(item.id)}>{item.label}</button>
        ))}
        <button type="button" onClick={() => void leave()}>Abmelden</button>
      </nav>
      <Desk section={section} />
    </main>
  );
}
