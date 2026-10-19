import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

if (!getApps().length) initializeApp();

export const db = (): Firestore => getFirestore();
