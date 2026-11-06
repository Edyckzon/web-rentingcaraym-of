'use client';
import {useMarketing} from '@/components/MarketingProvider';


import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check, Copy, MessageCircle } from 'lucide-react';

import { buildQuote, serviceOptions, todayInLima, type ServiceId } from '@/lib/quote';


export default function QuoteForm({ initialService = 'vehiculos' }: { initialService?: ServiceId }) {
  const {fleet}=useMarketing();
  const params = useSearchParams();
  const requestedService = params.get('servicio');
  const requestedModel = params.get('modelo');
  const defaultService = serviceOptions.some(option => option.value === requestedService) ? requestedService as ServiceId : initialService;
  const defaultModel = fleet.find(vehicle => vehicle.id === requestedModel)?.name || '';
  return <QuoteFields key={`${defaultService}:${defaultModel}`} defaultService={defaultService} defaultModel={defaultModel}/>;
}

function QuoteFields({ defaultService, defaultModel }: { defaultService: ServiceId; defaultModel: string }) {
  const {fleet,whatsappLink}=useMarketing();
  const [service, setService] = useState<ServiceId>(defaultService);
  const [today, setToday] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setToday(todayInLima()); }, []);
  useEffect(() => { if (summary) summaryRef.current?.focus(); }, [summary]);
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try { setSummary(buildQuote(new FormData(event.currentTarget))); setError(''); setCopied(false); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Revise los datos de la solicitud.'); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(summary); setCopied(true); }
    catch { setError('No se pudo copiar automáticamente. Puede seleccionar y copiar el resumen.'); }
  }
  const freight = service === 'transporte-de-carga';
  const heavy = service !== 'vehiculos' && service !== 'otro';
  return <div className="quote-panel" id="cotizacion">
    <p className="eyebrow">Su solicitud, paso a paso</p><h2>Solicitar cotización</h2><p>Complete los datos y revise su mensaje antes de enviarlo por WhatsApp.</p>
    <form onSubmit={prepare} onChange={() => { setSummary(''); setError(''); setCopied(false); }}>
      <div className="form-grid">
        <label className="full-field">Tipo de servicio <span aria-hidden="true">*</span><select name="service" value={service} onChange={event => setService(event.target.value as ServiceId)} required>{serviceOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        {service === 'vehiculos' && <label className="full-field">Vehículo de interés<select name="model" defaultValue={defaultModel}><option value="">Ayúdenme a elegir</option>{fleet.map(vehicle => <option key={vehicle.id} value={vehicle.name}>{vehicle.name}</option>)}</select></label>}
        <label>Nombre completo <span aria-hidden="true">*</span><input name="name" autoComplete="name" required maxLength={100}/></label>
        <label>Teléfono <span aria-hidden="true">*</span><input name="phone" type="tel" autoComplete="tel" required maxLength={25} placeholder="+51 999 999 999"/></label>
        <label>Correo electrónico<input name="email" type="email" autoComplete="email" maxLength={120} placeholder="Opcional"/></label>
        <label>Empresa<input name="company" autoComplete="organization" maxLength={120} placeholder="Opcional"/></label>
        <label>RUC<input name="ruc" inputMode="numeric" pattern="[0-9]{11}" maxLength={11} placeholder="Opcional · 11 dígitos"/></label>
        <label>Fecha de inicio <span aria-hidden="true">*</span><input name="start" type="date" required min={today}/></label>
        <label>Duración estimada <span aria-hidden="true">*</span><input name="duration" required maxLength={80} placeholder={freight ? 'Ej. un viaje' : 'Ej. 5 días o 1 mes'}/></label>
        <label>{freight ? 'Origen de la carga' : heavy ? 'Lugar de la obra' : 'Lugar de recojo'} <span aria-hidden="true">*</span><input name="location" required maxLength={160} placeholder="Distrito, ciudad o dirección"/></label>
        {freight && <label className="full-field">Destino de la carga <span aria-hidden="true">*</span><input name="destination" required maxLength={160} placeholder="Distrito, ciudad o dirección"/></label>}
        <label className="full-field">{freight ? 'Tipo, peso y dimensiones de la carga' : heavy ? 'Tipo de trabajo y equipo requerido' : 'Mensaje'}<textarea name="message" rows={4} maxLength={1200} placeholder={heavy ? 'Cuéntenos cantidades, accesos y si necesita operador o conductor.' : 'Cuéntenos lo que necesita para su servicio.'}/></label>
      </div>
      <label className="consent"><input type="checkbox" name="consent" required/><span>Autorizo el uso de mis datos para atender esta solicitud y he leído la <Link href="/politica-de-privacidad/" target="_blank">información de privacidad</Link>.</span></label>
      <p className="form-note">* Campos obligatorios. El envío se completa en WhatsApp. La solicitud no confirma una reserva.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button accent" type="submit">Preparar solicitud <ArrowRight size={18}/></button>
    </form>
    {summary && <div className="quote-summary" ref={summaryRef} tabIndex={-1} aria-labelledby="summary-title"><h3 id="summary-title">Su mensaje está listo</h3><p>Revise el resumen. Pulse «Abrir WhatsApp» y envíe el mensaje para que nuestro equipo lo reciba.</p><pre>{summary}</pre><div className="button-row"><a className="button whatsapp" href={whatsappLink(summary)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>Abrir WhatsApp</a><button type="button" className="button secondary" onClick={copy}>{copied ? <Check size={17}/> : <Copy size={17}/>} {copied ? 'Copiado' : 'Copiar mensaje'}</button></div><p className="form-note" role="status">{copied ? 'Mensaje copiado. Puede pegarlo en el chat.' : 'Puede volver al formulario y editar sus datos.'}</p></div>}
  </div>;
}
