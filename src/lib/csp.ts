export function contentSecurityPolicy(dev = process.env.NODE_ENV === 'development'): string {
  const script = dev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self'";
  const style = dev ? "style-src 'self' 'unsafe-inline'" : "style-src 'self'";
  return [
    "default-src 'self'",
    script,
    style,
    "img-src 'self' blob: data: https://firebasestorage.googleapis.com http://127.0.0.1:9199 http://localhost:9199",
    "font-src 'self'",
    "connect-src 'self' https://*.googleapis.com https://*.cloudfunctions.net https://*.run.app http://127.0.0.1:5001 http://127.0.0.1:9099 http://127.0.0.1:9199 http://localhost:5001 http://localhost:9099 http://localhost:9199",
    "frame-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ');
}
