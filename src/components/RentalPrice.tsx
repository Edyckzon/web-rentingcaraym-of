import { formatSoles, promotionIsActive, startingRentalRate, type RentalRates } from '@/lib/rental-pricing.mjs';
import { useCommercial } from './MarketingProvider';

export default function RentalPrice({ rates, vehicleId }: { rates?: RentalRates; vehicleId?: string }) {
  const commercial = useCommercial();
  const promotion = commercial?.promotions.find(item => item.vehicleId === vehicleId && promotionIsActive(item));
  if (promotion?.regularCents) return <div className="rental-price">
    <p><strong>{formatSoles(promotion.cents)}</strong><span> / día</span> <del>{formatSoles(promotion.regularCents)}</del></p>
    <small>{Math.floor((promotion.regularCents - promotion.cents) * 100 / promotion.regularCents)}% sobre tarifa diaria regular · Hasta el {promotion.ends.split('-').reverse().join('/')} · IGV incluido</small>
  </div>;
  const starting = startingRentalRate(rates, commercial?.rules);
  if (!starting) return <p className="rental-price-unlisted">Tarifa a consultar</p>;
  return <div className="rental-price">
    <p>Desde <strong>{formatSoles(starting.centsPerDay)}</strong><span> / día</span></p>
    <small>{starting.term} · IGV incluido</small>
  </div>;
}
