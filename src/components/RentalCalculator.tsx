'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, MessageCircle } from 'lucide-react';
import { emptyRentalRates, estimateRental, formatMoney, formatTotals, promotionIsActive } from '@/lib/rental-pricing.mjs';
import type { Vehicle } from '@/lib/fleet';
import { useCommercial, useMarketing } from './MarketingProvider';
import { trackEvent } from '@/lib/analytics';
import RentalRequestForm, { type RentalRequestDetails } from './RentalRequestForm';
import RentalPrice from './RentalPrice';
import ExchangeRate from './ExchangeRate';
import { useRentalDateBounds } from './useRentalDateBounds';
import RentalPrintQuote from './RentalPrintQuote';

type Estimate = ReturnType<typeof estimateRental>;
type Quote = { estimate: Estimate; message: string; ratesVersion: string; details: RentalRequestDetails; createdAt: string };

function displayDate(value: string) {
  const [date, time] = value.split('T');
  return `${date.split('-').reverse().join('/')} ${time}`;
}

export default function RentalCalculator({ vehicle }: { vehicle: Vehicle }) {
  const { business, whatsappLink } = useMarketing();
  const commercial = useCommercial();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');
  const [callback, setCallback] = useState(false);
  const [pickupInput, setPickup] = useState('');
  const [dropoffInput, setDropoff] = useState('');
  const [placeInput, setPlace] = useState('surco');
  const { pickupMin, returnMin } = useRentalDateBounds(pickupInput);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPickup(params.get('recojo') ?? '');
    setDropoff(params.get('devolucion') ?? '');
    setPlace(params.get('entrega') === 'lima' ? 'lima' : 'surco');
  }, []);
  const rates = vehicle.rates ?? emptyRentalRates;
  const promotion = commercial?.promotions.find(item => item.vehicleId === vehicle.id && promotionIsActive(item));
  const extras = commercial?.extras ?? [];
  const ratesVersion = JSON.stringify([rates, commercial?.rules, promotion, extras]);
  const estimate = quote?.estimate;
  const stale = quote !== null && quote.ratesVersion !== ratesVersion;

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const pickup = String(fields.get('pickup') ?? '');
    const dropoff = String(fields.get('dropoff') ?? '');
    const place = fields.get('place') === 'surco' ? `Local Surco (${business.address})` : 'Otro punto en Lima (consultar)';
    try {
      const selected = extras.filter(extra => fields.getAll('extra').includes(extra.id));
      const estimate = estimateRental(rates, pickup, dropoff, Date.now(), { rules: commercial?.rules, promotion, extras: selected });
      const { days, tier, total, deposit } = estimate;
      const message = [
        'Hola, Renting Car A&M. Quiero cotizar un vehículo.',
        `Vehículo: ${vehicle.name}`,
        `Recojo: ${displayDate(pickup)} · ${place}`,
        `Devolución: ${displayDate(dropoff)}`,
        `Duración: ${days} ${days === 1 ? 'día' : 'días'} · Tramo ${tier.toLowerCase()}`,
        `Extras: ${estimate.extras.map(extra => extra.name).join(', ') || 'Ninguno'}`,
        `Total estimado web: ${estimate.rental === null ? 'por confirmar' : `${formatTotals(estimate.totals)} (IGV incluido)`}`,
        `Garantía aparte: ${deposit === null ? 'por confirmar' : formatMoney(deposit, estimate.depositCurrency)}`,
        'Por favor, confirmen disponibilidad y condiciones.',
      ].join('\n');
      setError('');
      if (total !== null) trackEvent('cotizador_calculo', { modelo: vehicle.id, dias: days, tramo: tier });
      setQuote({ estimate, message, ratesVersion, createdAt:new Date().toISOString(), details: {
        vehicleId: vehicle.id, pickup, dropoff, place: placeInput, extras: selected.map(extra => extra.id), expectedTotal: total, expectedCurrency: estimate.currency, expectedTotals: estimate.totals,
      } });
    } catch (error) {
      setQuote(null);
      setError(error instanceof Error ? error.message : 'Revise las fechas.');
    }
  }

  return <>
    <div className="mobile-rental-bar">
      <RentalPrice rates={vehicle.rates} vehicleId={vehicle.id}/>
      {quote && !stale ? <a href={whatsappLink(quote.message)} data-origen="ficha_movil" className="button whatsapp" target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp</a>
        : <a href="#cotizador" data-origen="ficha_movil" className="button accent">Cotizar</a>}
    </div>
    <section id="cotizador" className="rental-calculator" aria-labelledby="rental-calculator-title">
    <h2 id="rental-calculator-title"><CalendarDays size={20} aria-hidden="true"/> Cotice su alquiler</h2>
    <form onSubmit={calculate} onChange={() => { setQuote(null); setCallback(false); setError(''); }}>
      <div className="rental-dates">
        <label>Recojo<input name="pickup" type="datetime-local" min={pickupMin} value={pickupInput} onChange={event => setPickup(event.target.value)} required/></label>
        <label>Devolución<input name="dropoff" type="datetime-local" min={returnMin} value={dropoffInput} onChange={event => setDropoff(event.target.value)} required/></label>
      </div>
      <label>Lugar de entrega<select name="place" value={placeInput} onChange={event => setPlace(event.target.value)}><option value="surco">Local Surco</option><option value="lima">Otro punto en Lima (consultar)</option></select></label>
      {extras.length > 0 && <fieldset className="rental-extras"><legend>Extras por día</legend>
        {extras.map(extra => <label key={extra.id}><input name="extra" value={extra.id} type="checkbox"/>{extra.name} · {formatMoney(extra.cents, extra.currency)}</label>)}
      </fieldset>}
      <p className="rental-caption">Puede elegir hoy o una fecha futura. Hora de Lima. Cada fracción de 24 horas cuenta como un día.</p>
      <button type="submit" className="button accent">Calcular alquiler</button>
    </form>
    <ExchangeRate/>
    {error && <p role="alert" className="rental-error">{error}</p>}
    {stale && <p role="status">La tarifa cambió. Calcule nuevamente.</p>}
    {quote && estimate && !stale && <div className="rental-result">
      <div role="status">
        <dl>
          <div><dt>Duración</dt><dd>{estimate.days} {estimate.days === 1 ? 'día' : 'días'}</dd></div>
          <div><dt>Tarifa {estimate.tier.toLowerCase()}</dt><dd>{estimate.rate === null ? 'Por consultar' : `${formatMoney(estimate.rate, estimate.currency)} / ${estimate.rateUnit}`}</dd></div>
          {estimate.extras.length > 0 && <div><dt>Extras</dt><dd>{formatTotals(estimate.extrasTotals)}</dd></div>}
          <div><dt>Garantía aparte</dt><dd>{estimate.deposit === null ? 'Por consultar' : formatMoney(estimate.deposit, estimate.depositCurrency)}</dd></div>
          <div className="rental-total"><dt>Total estimado</dt><dd>{estimate.rental === null ? 'Por consultar' : formatTotals(estimate.totals)}</dd></div>
        </dl>
        <p className="rental-caption">{estimate.rental !== null && 'IGV incluido. '}{estimate.mixedCurrencies && 'Importes separados por moneda, sin conversión. '}Sujeto a disponibilidad y verificación de documentos. La reserva se confirma con el equipo de A&M.</p>
      </div>
      <a className="button whatsapp" href={whatsappLink(quote.message)} data-origen="ficha" target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/> Enviar por WhatsApp</a>
      <RentalPrintQuote vehicle={vehicle} estimate={estimate} details={quote.details} createdAt={quote.createdAt} promotionTerms={estimate.promotion ? promotion?.terms : undefined}/>
      {commercial?.requestSiteKey && <>
        {!callback && <button type="button" className="button secondary" onClick={() => setCallback(true)}>Prefiero que me llamen</button>}
        {callback && <RentalRequestForm siteKey={commercial.requestSiteKey} details={quote.details}/>}
      </>}
    </div>}
  </section></>;
}
