'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { analyticsConfigured, analyticsConsentKey, analyticsContainer, trackEvent } from '@/lib/analytics';

export default function Analytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<string>();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!analyticsConfigured) return;
    try {
      const saved = localStorage.getItem(analyticsConsentKey);
      setConsent(saved ?? '');
      setOpen(saved === null);
    } catch { setConsent('deny'); }
  }, []);
  useEffect(() => {
    if (!analyticsConfigured || consent !== 'allow' || pathname.startsWith('/admin')) return;
    trackEvent('page_view', { page_location: `${window.location.origin}${pathname}` });
    const vehicle = document.querySelector<HTMLElement>('[data-vehicle-detail]');
    if (vehicle?.dataset.modelo) trackEvent('view_item', { modelo: vehicle.dataset.modelo, categoria: vehicle.dataset.categoria ?? '' });
    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!target) return;
      const href = target.getAttribute('href') ?? '';
      const model = target.closest<HTMLElement>('[data-modelo]')?.dataset.modelo ?? '';
      const origin = target.dataset.origen ?? (target.classList.contains('floating-whatsapp') ? 'flotante' : model ? 'ficha_o_tarjeta' : 'pagina');
      if (href.startsWith('https://wa.me/')) trackEvent('whatsapp_click', { origen: origin, modelo: model });
      if (href.startsWith('tel:')) trackEvent('llamada_click', { origen: origin });
      if (href.endsWith('#cotizador')) trackEvent('cotizar_click', { modelo: model, ubicacion: origin });
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [consent, pathname]);
  if (!analyticsConfigured || pathname.startsWith('/admin') || consent === undefined) return null;

  function choose(value: 'allow' | 'deny') {
    try { localStorage.setItem(analyticsConsentKey, value); }
    catch { setOpen(false); return; }
    if (consent === 'allow' && value === 'deny') {
      window.location.reload();
      return;
    }
    setConsent(value);
    setOpen(false);
  }

  return <>
    {consent === 'allow' && <Script src={`https://www.googletagmanager.com/gtm.js?id=${analyticsContainer}`} strategy="afterInteractive"/>}
    {open ? <section className="analytics-settings" aria-label="Preferencias de analítica">
      <p>¿Acepta el uso de cookies de analítica para medir visitas y consultas? <Link href="/politica-de-privacidad/">Privacidad</Link></p>
      <div className="button-row"><button className="button secondary" type="button" onClick={() => choose('deny')}>Rechazar</button>
        <button className="button accent" type="button" onClick={() => choose('allow')}>Aceptar analítica</button></div>
    </section> : <button type="button" className="analytics-preferences" onClick={() => setOpen(true)}>Cookies</button>}
  </>;
}
