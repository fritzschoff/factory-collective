import type { Request, Response } from 'express';
import type { Firestore } from 'firebase-admin/firestore';
import { allowedOrigins, listParam } from './params';

export function clientIp(req: Request): string {
  if (process.env.FUNCTIONS_EMULATOR === 'true') return req.socket?.remoteAddress || '127.0.0.1';
  const forwarded = req.header('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return req.socket?.remoteAddress || '0.0.0.0';
}

export function applyCors(req: Request, res: Response): boolean {
  const origin = req.header('origin');
  const allowed = listParam(allowedOrigins.value());
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key');
  }
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true;
  }
  if (origin && !allowed.includes(origin)) {
    res.status(403).json({ error: 'Origin not allowed.' });
    return true;
  }
  return false;
}

export async function rateLimit(db: Firestore, ip: string, bucket: 'checkout' | 'form', limit: number, now = Date.now()): Promise<boolean> {
  const ref = db.collection('ratelimits').doc(`${bucket}:${ip}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const start = snap.get('start');
    const count = snap.get('count');
    if (typeof start !== 'number' || now - start >= 60_000) {
      tx.set(ref, { start: now, count: 1 });
      return true;
    }
    if (typeof count === 'number' && count >= limit) return false;
    tx.update(ref, { count: (typeof count === 'number' ? count : 0) + 1 });
    return true;
  });
}

export const sendJson = (res: Response, status: number, body: unknown): void => {
  res.status(status).json(body);
};
