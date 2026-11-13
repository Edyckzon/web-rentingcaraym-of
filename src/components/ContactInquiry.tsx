'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { serviceOptions } from '@/lib/quote';
import { useMarketing } from './MarketingProvider';

export default function ContactInquiry() {
  const params = useSearchParams();
  const { fleet, whatsappLink } = useMarketing();
  const service = serviceOptions.find(item => item.value === params.get('servicio'));
  const vehicle = fleet.find(item => item.id === params.get('modelo'));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  return <section className="quote-panel" id="cotizacion" aria-labelledby="contact-inquiry-title">
    <h2 id="contact-inquiry-title">Cuéntenos qué necesita</h2>
    {vehicle && <p>Vehículo de interés: {vehicle.name}</p>}
    <form onChange={() => { setMessage(''); setError(''); }} onSubmit={event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const value = (name: string) => String(data.get(name) ?? '').trim();
      const digits = value('phone').replace(/\D/g, '');
      if (!value('name') || digits.length < 7 || digits.length > 15) { setError('Revise su nombre y teléfono.'); return; }
      const service = serviceOptions.find(item => item.value === value('service'));
      setMessage([
        'Hola, Renting Car A&M. Quiero consultar por un servicio.',
        `Servicio: ${service?.label ?? 'Otro'}`,
        vehicle && service?.value === 'vehiculos' ? `Modelo: ${vehicle.name}` : '',
        `Nombre: ${value('name')}`, `Teléfono: ${value('phone')}`,
        value('email') ? `Correo: ${value('email')}` : '',
        value('message') ? `Consulta: ${value('message')}` : '',
      ].filter(Boolean).join('\n'));
    }}>
      <div className="form-grid">
        <label className="full-field">Servicio<select name="service" defaultValue={service?.value ?? 'vehiculos'}>{serviceOptions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label>Nombre<input name="name" maxLength={100} autoComplete="name" required/></label>
        <label>Celular<input name="phone" type="tel" maxLength={25} autoComplete="tel" required/></label>
        <label>Correo (opcional)<input name="email" type="email" maxLength={160} autoComplete="email"/></label>
        <label className="full-field">Mensaje (opcional)<textarea name="message" maxLength={1200} rows={3}/></label>
      </div>
      <label className="consent"><input type="checkbox" required/><span>Autorizo el uso de mis datos para atender esta consulta. <Link href="/politica-de-privacidad/">Información de privacidad</Link>.</span></label>
      <button className="button accent" type="submit">Preparar consulta</button>
      {error && <p role="alert">{error}</p>}
    </form>
    {message && <div className="quote-summary"><h3>Revise su consulta</h3><pre>{message}</pre><a className="button whatsapp" data-origen="contacto" href={whatsappLink(message)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>Abrir WhatsApp</a></div>}
  </section>;
}
