'use client';
import CurrencyEquivalent from './CurrencyEquivalent';

import { useCommercial } from './MarketingProvider';
import { formatMoney } from '@/lib/rental-pricing.mjs';

export default function ServicePrice({ service }: { service: string }) {
  const rate = useCommercial()?.services?.find(item => item.id === service);
  if (rate?.cents == null) return <p className="rental-price-unlisted">Tarifa a consultar</p>;
  return <div className="rental-price"><p>Desde <strong>{formatMoney(rate.cents, rate.currency)}</strong> / {rate.unit}</p><CurrencyEquivalent cents={rate.cents} currency={rate.currency} unit={rate.unit}/><small>IGV incluido</small></div>;
}
