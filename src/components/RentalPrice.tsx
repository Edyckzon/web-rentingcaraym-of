import CurrencyEquivalent from './CurrencyEquivalent';
import { formatMoney, promotionIsActive, startingRentalRates, type RentalRates } from '@/lib/rental-pricing.mjs';
import { useCommercial } from './MarketingProvider';

export default function RentalPrice({ rates, vehicleId }: { rates?: RentalRates; vehicleId?: string }) {
  const commercial = useCommercial();
  const promotion = commercial?.promotions.find(item => item.vehicleId === vehicleId && promotionIsActive(item));
  if (promotion?.regularCents) return <div className="rental-price">
    <p><strong>{formatMoney(promotion.cents, promotion.currency)}</strong><span> / día</span> <del>{formatMoney(promotion.regularCents, promotion.currency)}</del></p>
    <CurrencyEquivalent cents={promotion.cents} currency={promotion.currency} unit="día"/>
    <small>{Math.floor((promotion.regularCents - promotion.cents) * 100 / promotion.regularCents)}% sobre tarifa diaria regular · Hasta el {promotion.ends.split('-').reverse().join('/')} · IGV incluido</small>
  </div>;
  const starting = startingRentalRates(rates, commercial?.rules);
  if (!starting.length) return <p className="rental-price-unlisted">Tarifa a consultar</p>;
  return <div className="rental-price">
    {starting.map(rate => <div key={rate.currency}><p>Desde <strong>{formatMoney(rate.centsPerDay, rate.currency)}</strong><span> / día</span></p>
    <CurrencyEquivalent cents={rate.centsPerDay} currency={rate.currency} unit="día" mode={rates?.secondaryMode?.[rate.key]} secondary={rates?.secondary?.[rate.key] == null ? null : Math.round(rates.secondary[rate.key]! / rate.divisor)}/>
    <small>{rate.term} · IGV incluido</small></div>)}
  </div>;
}
