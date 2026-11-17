'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer } from 'lucide-react';
import { estimateRental, formatMoney, type Currency } from '@/lib/rental-pricing.mjs';
import type { Vehicle } from '@/lib/fleet';
import brandLogo from '@/lib/img/RENTING-CAR.png';
import { useMarketing } from './MarketingProvider';
import type { RentalRequestDetails } from './RentalRequestForm';
import './rental-print.css';

const dateTime = (value:string) => {
  const [date,time] = value.split('T');
  return `${date.split('-').reverse().join('/')} · ${time}`;
};
const issued = new Intl.DateTimeFormat('es-PE', { dateStyle:'long', timeStyle:'short', timeZone:'America/Lima' });

export default function RentalPrintQuote({ vehicle, estimate, details, createdAt, promotionTerms }: {
  vehicle: Vehicle; estimate: ReturnType<typeof estimateRental>; details: RentalRequestDetails;
  createdAt: string; promotionTerms?: string;
}) {
  const { business, whatsappLabel } = useMarketing();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const originalTitle = useRef<string | null>(null);
  useEffect(() => {
    setMounted(true);
    const restore = () => {
      document.body.classList.remove('rental-printing');
      if (originalTitle.current !== null) document.title = originalTitle.current;
      originalTitle.current = null;
    };
    window.addEventListener('afterprint', restore);
    return () => { window.removeEventListener('afterprint', restore); restore(); };
  }, []);
  function print() {
    setError('');
    originalTitle.current = document.title;
    document.title = `Cotización - ${vehicle.name} - Renting Car A&M`;
    document.body.classList.add('rental-printing');
    try { window.print(); }
    catch {
      window.dispatchEvent(new Event('afterprint'));
      setError('No se pudo abrir la impresión. Use la opción Imprimir de su navegador.');
    }
  }
  const money = (value:number | null, currency:Currency) => value === null ? 'Por confirmar' : formatMoney(value, currency);
  return <>
    <button type="button" className="button rental-print-button" onClick={print} disabled={!mounted}><Printer size={18} aria-hidden="true"/> Imprimir cotización</button>
    <p className="rental-caption">También puede guardarla como PDF desde la ventana de impresión.</p>
    {error && <p role="alert">{error}</p>}
    {mounted && createPortal(<article className="rental-print-sheet" aria-label="Cotización para imprimir">
      <header className="rq-header">
        <div><img src={brandLogo.src} alt="Renting Car A&M" width={180} height={Math.round(180 * brandLogo.height / brandLogo.width)}/><p>Alquiler de vehículos · Grupo A&M</p></div>
        <div className="rq-heading"><span>RENTING CAR A&M</span><h1>Cotización de alquiler</h1><p>Referencial · emitida desde la web</p></div>
      </header>
      <p className="rq-issued">Emitida el {issued.format(new Date(createdAt))} · Hora de Lima</p>
      <section className="rq-model"><p>Vehículo seleccionado</p><h2>{vehicle.name}</h2><span>{vehicle.category}</span></section>
      <dl className="rq-dates">
        <div><dt>Recojo</dt><dd>{dateTime(details.pickup)}</dd></div>
        <div><dt>Devolución / regreso</dt><dd>{dateTime(details.dropoff)}</dd></div>
        <div><dt>Duración facturable</dt><dd>{estimate.days} {estimate.days === 1 ? 'día' : 'días'}</dd></div>
        <div><dt>Tramo aplicado</dt><dd>{estimate.tier}</dd></div>
        <div className="rq-wide"><dt>Lugar de entrega / recojo</dt><dd>{details.place === 'surco' ? `Local Surco · ${business.address}` : 'Otro punto en Lima · por coordinar'}</dd></div>
      </dl>
      <h2 className="rq-section-title">Detalle de importes</h2>
      <table className="rq-items"><thead><tr><th>Concepto</th><th>Cantidad</th><th>Tarifa</th><th>Importe</th></tr></thead>
        <tbody><tr><td>Alquiler · {estimate.tier.toLowerCase()}{estimate.promotion && <small>{estimate.promotion}</small>}</td>
          <td>{estimate.days} días</td><td>{money(estimate.rate, estimate.currency)} / {estimate.rateUnit}</td><td>{money(estimate.rental, estimate.currency)}</td></tr>
          {estimate.extras.map(extra => <tr key={extra.id}><td>{extra.name}</td><td>{estimate.days} días</td>
            <td>{formatMoney(extra.cents, extra.currency)} / día</td><td>{formatMoney(extra.cents * estimate.days, extra.currency)}</td></tr>)}
        </tbody>
      </table>
      {!estimate.extras.length && <p className="rq-small">Sin extras seleccionados.</p>}
      {estimate.chargeDivisor > 1 && <p className="rq-small">Prorrateo mensual: {estimate.days} días de alquiler / {estimate.chargeDivisor} días por mes{estimate.promotion ? ', con el descuento promocional indicado' : ''}.</p>}
      <section className="rq-totals"><h2>{estimate.rental === null ? 'Importes conocidos · alquiler por confirmar' : 'Total estimado · IGV incluido'}</h2>
        {Object.entries(estimate.totals).map(([currency,cents]) => <p key={currency}><span>{currency === 'USD' ? 'Dólares estadounidenses (USD)' : 'Soles (PEN)'}</span><strong>{formatMoney(cents, currency as Currency)}</strong></p>)}
        {estimate.rental === null && <p>Solicite el importe del alquiler a nuestro equipo.</p>}
        {estimate.mixedCurrencies && <small>Subtotales independientes por moneda. No se han realizado conversiones.</small>}
      </section>
      <div className="rq-deposit"><span>Garantía aparte · no incluida en el total</span><strong>{money(estimate.deposit, estimate.depositCurrency)}</strong></div>
      <section className="rq-conditions"><h2>Condiciones de la cotización</h2>
        <p>Cada fracción de 24 horas cuenta como un día. Los precios indicados incluyen IGV. La garantía se considera por separado.</p>
        <p>Documento referencial, sujeto a disponibilidad y verificación de documentos. No constituye una reserva ni un comprobante de pago. El equipo de A&M confirma los precios y las condiciones antes de reservar.</p>
        <p>Si desea pagar en otra moneda, consulte el tipo de cambio aplicable con nuestro equipo.</p>
        {promotionTerms && <div><h3>Bases de la promoción · {estimate.promotion}</h3><p className="rq-terms">{promotionTerms}</p></div>}
      </section>
      <footer className="rq-footer"><strong>Renting Car A&M</strong><p>WhatsApp: {whatsappLabel} · Teléfono: {business.phoneLabel}</p>
        <p>{business.email} · rentingcaraym.com</p><p>{business.address}</p><small>© {new Date(createdAt).getFullYear()} Grupo A&M · grupoaym.com</small></footer>
    </article>, document.body)}
  </>;
}
