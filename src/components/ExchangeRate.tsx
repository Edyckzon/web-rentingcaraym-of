'use client';

import { useCommercial, useExchangeReference } from './MarketingProvider';
import './exchange-rate.css';

const source = 'https://estadisticas.bcrp.gob.pe/estadisticas/series/diarias/tipo-de-cambio-nominal';
const number = new Intl.NumberFormat('es-PE', { minimumFractionDigits:3, maximumFractionDigits:3 });

export default function ExchangeRate({ admin=false }: {admin?:boolean}) {
  const rate = useExchangeReference();
  const settings=useCommercial()?.priceDisplay;
  if(!admin && !settings?.showRate)return null;
  if(!admin && settings?.source==='manual') return <aside className="exchange-reference"><strong>Tipo de cambio referencial</strong><p>S/ {number.format(settings.manualRate ?? 0)} por US$ 1 · {settings.manualDate?.split('-').reverse().join('/')}</p><small>Referencia configurada por A&M. Confirme el tipo de cambio aplicable al pagar en otra moneda.</small></aside>;
  return <aside className="exchange-reference" aria-label="Tipo de cambio referencial">
    <strong>Tipo de cambio · USD / PEN</strong>
    <p role="status">{!rate ? 'Consultando referencia del BCRP…' : rate.available && rate.date && rate.buy && rate.sell
      ? <>{rate.today ? 'Dato del día' : 'Último dato disponible'} · {rate.date.split('-').reverse().join('/')}<br/>
        Compra S/ {number.format(rate.buy)} · Venta S/ {number.format(rate.sell)} por US$ 1</>
      : 'Tipo de cambio no disponible. Consulte el tipo de cambio vigente con nuestro equipo.'}</p>
    <small><a href={source} target="_blank" rel="noopener noreferrer">Fuente: BCRP · interbancario</a>. Referencial. Confirme el tipo de cambio aplicable si paga en otra moneda.</small>
  </aside>;
}
