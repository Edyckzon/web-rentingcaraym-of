type Fields = Record<string, string | number>;

export const analyticsConsentKey = 'renting-analytics-v1';
export const analyticsContainer = process.env.NEXT_PUBLIC_GTM_ID ?? '';
export const analyticsConfigured = /^GTM-[A-Z0-9]+$/.test(analyticsContainer);

export function trackEvent(event: string, fields: Fields = {}) {
  if (!analyticsConfigured || typeof window === 'undefined' || window.location.pathname.startsWith('/admin')) return;
  try { if (localStorage.getItem(analyticsConsentKey) !== 'allow') return; }
  catch { return; }
  const host = window as Window & { dataLayer?: Record<string, unknown>[] };
  (host.dataLayer ??= []).push({ event, pagina: window.location.pathname, ...fields });
}
