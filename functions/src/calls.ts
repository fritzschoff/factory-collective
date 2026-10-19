import './options';
import { onCall } from 'firebase-functions/v2/https';
import { db } from './admin';
import { getOrder, listEnquiries, listNewsletter, listOrders, updateOrder } from './desk-admin';
import { requireAdmin } from './guard';
import { createUpload, registerImage, storageBucket } from './images-admin';
import { getProduct, listProducts, listStock, saveProduct, setOnHand } from './products-admin';

export const adminWhoami = onCall((request) => {
  const admin = requireAdmin(request);
  return { email: admin.email };
});

export const adminListProducts = onCall(async (request) => {
  requireAdmin(request);
  return { products: await listProducts(db()) };
});

export const adminGetProduct = onCall(async (request) => {
  requireAdmin(request);
  const found = await getProduct(db(), String(request.data?.id ?? ''));
  return found ?? { product: null, stock: {} };
});

export const adminCreateUpload = onCall(async (request) => {
  requireAdmin(request);
  const data = request.data ?? {};
  return createUpload(String(data.productId ?? ''), String(data.filename ?? 'image'), String(data.contentType ?? ''));
});

export const adminRegisterImage = onCall(async (request) => {
  requireAdmin(request);
  return { image: await registerImage(storageBucket(), request.data?.image) };
});

export const adminSaveProduct = onCall(async (request) => {
  const admin = requireAdmin(request);
  return saveProduct(db(), request.data, admin.email);
});

export const adminListStock = onCall(async (request) => {
  requireAdmin(request);
  return { items: await listStock(db()) };
});

export const adminSetOnHand = onCall(async (request) => {
  requireAdmin(request);
  const onHand = request.data?.onHand;
  await setOnHand(db(), String(request.data?.sku ?? ''), onHand == null ? null : Number(onHand));
  return { ok: true };
});

export const adminListOrders = onCall(async (request) => {
  requireAdmin(request);
  return { orders: await listOrders(db()) };
});

export const adminGetOrder = onCall(async (request) => {
  requireAdmin(request);
  return { order: await getOrder(db(), String(request.data?.id ?? '')) };
});

export const adminUpdateOrder = onCall(async (request) => {
  requireAdmin(request);
  const data = request.data ?? {};
  await updateOrder(db(), String(data.id ?? ''), {
    status: typeof data.status === 'string' ? data.status : undefined,
    tracking: typeof data.tracking === 'string' ? data.tracking : undefined,
    note: typeof data.note === 'string' ? data.note : undefined,
    restock: data.restock === true,
  });
  return { ok: true };
});

export const adminListEnquiries = onCall(async (request) => {
  requireAdmin(request);
  return { enquiries: await listEnquiries(db()) };
});

export const adminListNewsletter = onCall(async (request) => {
  requireAdmin(request);
  return { entries: await listNewsletter(db()) };
});
