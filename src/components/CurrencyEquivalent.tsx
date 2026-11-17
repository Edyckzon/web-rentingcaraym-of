'use client';

import { useCommercial, useExchangeReference } from './MarketingProvider';
import { currencyEquivalent } from '@/lib/currency-display.mjs';
import { formatMoney, type Currency } from '@/lib/rental-pricing.mjs';
import './currency-equivalent.css';

export default function CurrencyEquivalent({ cents, currency = 'PEN', unit, secondary, mode='tc' }: { cents:number; currency?:Currency; unit?:string; secondary?:number|null; mode?:'manual'|'tc' }) {
  const commercial=useCommercial();
  const reference=useExchangeReference();
  const equivalent=currencyEquivalent(cents,currency,commercial?.priceDisplay,reference);
  if(!commercial?.priceDisplay?.enabled)return null;
  if(mode==='manual') return secondary == null ? null : <span className="currency-equivalent"><span className="currency-equivalent-value">o {formatMoney(secondary,currency==='PEN'?'USD':'PEN')}{unit && ` / ${unit}`}</span></span>;
  if(!equivalent)return <small className="currency-equivalent currency-unavailable">Equivalente por confirmar</small>;
  return <span className="currency-equivalent">
    <span className="currency-equivalent-value">≈ {formatMoney(equivalent.cents,equivalent.currency)}{unit && ` / ${unit}`}</span>
    {commercial.priceDisplay.showRate && <small title={`S/ ${equivalent.rate.toFixed(4)} por US$ 1`}>Ref. {equivalent.source} · {equivalent.date.split('-').reverse().join('/')}</small>}
  </span>;
}
