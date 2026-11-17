'use client';

import { useEffect, useState } from 'react';
import './exchange-rate.css';

type Reference = { available:boolean; date?:string; buy?:number; sell?:number; today?:boolean };
const source = 'https://estadisticas.bcrp.gob.pe/estadisticas/series/diarias/tipo-de-cambio-nominal';
const number = new Intl.NumberFormat('es-PE', { minimumFractionDigits:3, maximumFractionDigits:3 });

export default function ExchangeRate() {
  const [rate, setRate] = useState<Reference>();
  useEffect(() => {
    const controller = new AbortController();
    fetch('/marketing-api/exchange-rate', { signal:controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Unavailable');
      const value = await response.json();
      if (!controller.signal.aborted) setRate(value);
    }).catch(() => { if (!controller.signal.aborted) setRate({ available:false }); });
    return () => controller.abort();
  }, []);
  return <aside className="exchange-reference" aria-label="Tipo de cambio referencial">
    <strong>Tipo de cambio · USD / PEN</strong>
    <p role="status">{!rate ? 'Consultando referencia del BCRP…' : rate.available && rate.date && rate.buy && rate.sell
      ? <>{rate.today ? 'Dato del día' : 'Último dato disponible'} · {rate.date.split('-').reverse().join('/')}<br/>
        Compra S/ {number.format(rate.buy)} · Venta S/ {number.format(rate.sell)} por US$ 1</>
      : 'Tipo de cambio no disponible. Consulte el tipo de cambio vigente con nuestro equipo.'}</p>
    <small><a href={source} target="_blank" rel="noopener noreferrer">Fuente: BCRP · interbancario</a>. Referencial; no convierte las tarifas. Confirme el tipo de cambio aplicable si paga en otra moneda.</small>
  </aside>;
}
