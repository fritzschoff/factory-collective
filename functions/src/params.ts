import { defineSecret, defineString } from 'firebase-functions/params';

export const stripeSecret = defineSecret('STRIPE_SECRET_KEY');
export const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');
export const resendKey = defineSecret('RESEND_API_KEY');

export const siteUrl = defineString('SITE_URL', { default: 'http://localhost:3000' });
export const allowedOrigins = defineString('ALLOWED_ORIGINS', { default: 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3100,http://127.0.0.1:3100' });
export const shippingCountries = defineString('SHIPPING_COUNTRIES', { default: 'DE,AT,CH,FR,NL,BE,IT,ES,GB,US' });
export const stripeShippingRates = defineString('STRIPE_SHIPPING_RATES', { default: '' });
export const stripeAutomaticTax = defineString('STRIPE_AUTOMATIC_TAX', { default: 'false' });
export const enquiryTo = defineString('ENQUIRY_TO', { default: '' });
export const mailFrom = defineString('MAIL_FROM', { default: '' });

export const listParam = (value: string): string[] => value.split(',').map((item) => item.trim()).filter(Boolean);

export function secretValue(read: () => string): string {
  try { return read(); } catch { return ''; }
}
