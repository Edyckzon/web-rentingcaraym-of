'use client';

import { useCommercial } from './MarketingProvider';
import { formatSoles } from '@/lib/rental-pricing.mjs';

export default function ServicePrice({ service }: { service: string }) {
  const rate = useCommercial()?.services?.find(item => item.id === service);
  if (rate?.cents == null) return <p className="rental-price-unlisted">Tarifa a consultar</p>;
  return <div className="rental-price"><p>Desde <strong>{formatSoles(rate.cents)}</strong> / {rate.unit}</p><small>IGV incluido</small></div>;
}
