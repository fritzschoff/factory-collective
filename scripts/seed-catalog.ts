import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { imageSize } from 'image-size';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { inventoryDocs, openingStock, readPrices, shopProductFromCode, specForStore, type ShopImage } from '@cfc/shop-core';
import { PRODUCTS } from '../src/content/catalog';
import { resolveSlot } from '../src/lib/images';

function envFile(name: string): string {
  if (!existsSync('.env.local')) return '';
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    if (!line.startsWith(`${name}=`)) continue;
    return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

function contentType(file: string): string {
  const ext = path.extname(file).slice(1).toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'avif') return 'image/avif';
  return 'image/jpeg';
}

function downloadUrl(bucket: string, objectPath: string, token: string): string {
  const encoded = encodeURIComponent(objectPath);
  const emulator = process.env.FIREBASE_STORAGE_EMULATOR_HOST || process.env.STORAGE_EMULATOR_HOST;
  if (emulator) return `http://${emulator}/v0/b/${bucket}/o/${encoded}?alt=media&token=${token}`;
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}?alt=media&token=${token}`;
}

async function uploadImages(productId: string, slots: readonly string[], alt: string, focus: string | null, bucketName: string): Promise<ShopImage[]> {
  const bucket = getStorage().bucket(bucketName);
  const images: ShopImage[] = [];
  for (let index = 0; index < slots.length; index += 1) {
    const slot = slots[index];
    const resolved = resolveSlot(slot);
    if (!resolved.src) {
      images.push({ path: '', url: '', width: 0, height: 0, alt, focus, slot });
      continue;
    }
    const filePath = path.join('public', resolved.src);
    const bytes = readFileSync(filePath);
    const dim = imageSize(bytes);
    const token = randomUUID();
    const objectPath = `products/${productId}/${index}-${path.basename(filePath)}`;
    await bucket.file(objectPath).save(bytes, {
      contentType: contentType(filePath),
      metadata: { metadata: { firebaseStorageDownloadTokens: token }, cacheControl: 'public, max-age=31536000' },
    });
    images.push({ path: objectPath, url: downloadUrl(bucket.name, objectPath, token), width: dim.width ?? 0, height: dim.height ?? 0, alt, focus, slot });
  }
  return images;
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export async function applySeed(db: Firestore, bucketName: string): Promise<{ products: number; inventory: number }> {
  const prices = readPrices(JSON.parse(readFileSync('src/content/prices.json', 'utf8')) as Record<string, unknown>, new Set(PRODUCTS.map((product) => product.id)));
  let inventory = 0;
  for (const product of PRODUCTS) {
    const images = await uploadImages(product.id, product.images, `${product.code} — ${product.name}`, product.pos ?? null, bucketName);
    const shop = shopProductFromCode(product, prices.get(product.id) ?? null, images);
    const clean = JSON.parse(JSON.stringify({ ...shop, spec: specForStore(shop.spec) })) as typeof shop;
    await db.collection('products').doc(product.id).set(clean);
    const docs = inventoryDocs(shop, openingStock(product));
    for (const group of chunk(docs, 400)) {
      const refs = group.map((doc) => db.collection('inventory').doc(doc.sku));
      const snaps = await db.getAll(...refs);
      const batch = db.batch();
      snaps.forEach((snap, index) => {
        if (!snap.exists) {
          batch.set(snap.ref, group[index]);
          inventory += 1;
        }
      });
      await batch.commit();
    }
  }
  return { products: PRODUCTS.length, inventory };
}

function initAdmin(): void {
  if (getApps().length) return;
  const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || envFile('FIREBASE_PROJECT_ID') || envFile('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || 'demo-cfc';
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || envFile('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') || `${projectId}.appspot.com`;
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    initializeApp({ projectId, storageBucket });
    return;
  }
  initializeApp(keyFile ? { credential: cert(JSON.parse(readFileSync(keyFile, 'utf8'))), projectId, storageBucket } : { credential: applicationDefault(), projectId, storageBucket });
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isDirect) {
  initAdmin();
  const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || envFile('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || 'demo-cfc';
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || envFile('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') || `${projectId}.appspot.com`;
  applySeed(getFirestore(), bucketName).then((result) => {
    console.log(`Seeded ${result.products} products, ${result.inventory} new inventory rows.`);
  }).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
