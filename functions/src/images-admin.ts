import { randomUUID } from 'node:crypto';
import { HttpsError } from 'firebase-functions/v2/https';
import { getStorage } from 'firebase-admin/storage';
import type { ShopImage } from '@cfc/shop-core';

const TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

/** The default bucket as Cloud Functions describe it in FIREBASE_CONFIG (new projects use <id>.firebasestorage.app). */
function configuredBucket(config = process.env.FIREBASE_CONFIG): string {
  try {
    const bucket = (JSON.parse(config ?? '{}') as { storageBucket?: unknown }).storageBucket;
    return typeof bucket === 'string' ? bucket : '';
  } catch {
    return '';
  }
}

export function storageBucket(): string {
  return process.env.FIREBASE_STORAGE_BUCKET || process.env.STORAGE_BUCKET || configuredBucket() || `${process.env.GCLOUD_PROJECT || 'demo-cfc'}.appspot.com`;
}

export function downloadUrl(bucket: string, objectPath: string, token: string): string {
  const encoded = encodeURIComponent(objectPath);
  const emulator = process.env.FIREBASE_STORAGE_EMULATOR_HOST || process.env.STORAGE_EMULATOR_HOST;
  if (emulator) return `http://${emulator}/v0/b/${bucket}/o/${encoded}?alt=media&token=${token}`;
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}?alt=media&token=${token}`;
}

function safeName(filename: string): string {
  const base = (filename.split(/[/\\]/).pop() ?? 'image').toLowerCase();
  const cleaned = base.replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  return cleaned || 'image';
}

export async function createUpload(productId: string, filename: string, contentType: string, bucketName = storageBucket()): Promise<{ uploadUrl: string; method: 'PUT' | 'POST'; headers: Record<string, string>; image: ShopImage }> {
  if (!/^[A-Za-z0-9][A-Za-z0-9.-]{0,40}$/.test(productId)) throw new HttpsError('invalid-argument', 'Bitte zuerst eine Kennung eintragen.');
  if (!TYPES.has(contentType)) throw new HttpsError('invalid-argument', 'Bitte ein JPEG, PNG, WebP oder AVIF.');
  const token = randomUUID();
  const path = `products/${productId}/${randomUUID()}-${safeName(filename)}`;
  const emulator = process.env.FIREBASE_STORAGE_EMULATOR_HOST || process.env.STORAGE_EMULATOR_HOST;
  const headers: Record<string, string> = { 'content-type': contentType };
  let uploadUrl: string;
  let method: 'PUT' | 'POST' = 'PUT';
  if (emulator) {
    uploadUrl = `http://${emulator}/upload/storage/v1/b/${bucketName}/o?uploadType=media&name=${encodeURIComponent(path)}`;
    headers.authorization = 'Bearer owner';
    method = 'POST';
  } else {
    const file = getStorage().bucket(bucketName).file(path);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
      extensionHeaders: { 'x-goog-meta-firebasestoragedownloadtokens': token },
    });
    uploadUrl = url;
    headers['x-goog-meta-firebasestoragedownloadtokens'] = token;
  }
  return {
    uploadUrl,
    method,
    headers,
    image: { path, url: downloadUrl(bucketName, path, token), width: 0, height: 0, alt: '', focus: null, slot: '' },
  };
}

export async function registerImage(bucketName: string, image: ShopImage): Promise<ShopImage> {
  if (!image.path.startsWith('products/')) throw new HttpsError('invalid-argument', 'Dieser Bildpfad ist ungültig.');
  const file = getStorage().bucket(bucketName).file(image.path);
  const [exists] = await file.exists();
  if (!exists) throw new HttpsError('not-found', 'Der Upload ist nicht angekommen.');
  const token = new URL(image.url).searchParams.get('token') ?? randomUUID();
  await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token }, contentType: contentTypeOf(image.path), cacheControl: 'public, max-age=31536000' });
  return { ...image, url: downloadUrl(bucketName, image.path, token) };
}

function contentTypeOf(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'avif') return 'image/avif';
  return 'image/jpeg';
}
