'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { trackEvent } from '@/lib/analytics';

export type RentalRequestDetails = {
  vehicleId: string; pickup: string; dropoff: string; place: string; extras: string[]; expectedTotal: number | null;
};

type Challenge = {
  render: (host: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widget: string) => void;
  remove: (widget: string) => void;
};

function browserChallenge() { return (window as Window & { turnstile?: Challenge }).turnstile; }

export default function RentalRequestForm({ siteKey, details }: { siteKey: string; details: RentalRequestDetails }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState('');
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string>(null);
  const id = useRef<string>(null);

  useEffect(() => {
    const challenge = browserChallenge();
    if (!ready || !container.current || !challenge || receipt) return;
    const current = challenge.render(container.current, {
      sitekey: siteKey, action: 'solicitud_alquiler', size: 'flexible',
      callback: (value: string) => setToken(value),
      'expired-callback': () => setToken(''),
      'error-callback': () => { setToken(''); setError('No se pudo cargar la verificación. También puede consultar por WhatsApp.'); },
    });
    widget.current = current;
    return () => { challenge.remove(current); widget.current = null; };
  }, [siteKey, ready, receipt]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || saving) return;
    const form = new FormData(event.currentTarget);
    const input = Object.fromEntries(['name','phone','email','document','comment'].map(key => [key, form.get(key) ?? '']));
    id.current ??= crypto.randomUUID();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/marketing-api/rental-request/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...details, ...input, id: id.current, turnstile: token, consent: form.has('consent') }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo enviar la solicitud.');
      setReceipt(result.id);
      trackEvent('formulario_envio', { servicio: 'alquiler', modelo: details.vehicleId });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo enviar la solicitud.');
      setToken('');
      if (widget.current) browserChallenge()?.reset(widget.current);
    } finally { setSaving(false); }
  }

  if (receipt) return <p className="rental-receipt" role="status">Solicitud recibida. Su código es <strong>{receipt}</strong>. El equipo le contactará para confirmar condiciones.</p>;
  return <form className="rental-request-form" onSubmit={submit}>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)}
      onError={() => setError('No se pudo cargar la verificación. Puede consultar por WhatsApp.')}/>
    <fieldset disabled={saving}>
      <legend>Solicite una llamada</legend>
      <label>Nombre<input name="name" autoComplete="name" maxLength={100} required/></label>
      <label>Celular<input name="phone" type="tel" autoComplete="tel" maxLength={25} required/></label>
      <label>Correo (opcional)<input name="email" type="email" autoComplete="email" maxLength={160}/></label>
      <label>DNI o RUC (opcional)<input name="document" maxLength={20}/></label>
      <label>Comentario (opcional)<textarea name="comment" maxLength={1200} rows={3}/></label>
      <label className="rental-consent"><input type="checkbox" name="consent" required/>
        <span>Autorizo a A&M a usar estos datos para atender mi solicitud. <Link href="/politica-de-privacidad/" target="_blank">Información de privacidad</Link>.</span>
      </label>
      <div ref={container}/>
      <button className="button accent" type="submit" disabled={!token || saving}>{saving ? 'Enviando…' : 'Enviar solicitud'}</button>
    </fieldset>
    {error && <p role="alert" className="rental-error">{error}</p>}
  </form>;
}
