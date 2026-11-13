'use client';

import Link from 'next/link';
import { useCommercial, useMarketing, detailUrl } from './MarketingProvider';
import { formatSoles, promotionIsActive } from '@/lib/rental-pricing.mjs';

export function PromotionRibbon() {
  const promotion = useCommercial()?.promotions.find(item => promotionIsActive(item));
  if (!promotion) return null;
  return <div className="promo-ribbon"><Link href="/promociones/">{promotion.banner || promotion.title} · Ver promoción</Link></div>;
}

export function PromotionList() {
  const { fleet } = useMarketing();
  const commercial = useCommercial();
  if (!commercial) return <p role="status">Consultando promociones…</p>;
  const promotions = commercial.promotions.filter(item => promotionIsActive(item));
  if (!promotions.length) return <p>No hay promociones vigentes. <Link href="/flota/">Ver catálogo y tarifas</Link></p>;
  return <div className="vehicle-grid">{promotions.map(item => {
    const vehicle = fleet.find(model => model.id === item.vehicleId);
    if (!vehicle) return null;
    return <article className="promotion-card" key={item.id}>
      <h2>{item.title}</h2><p>{vehicle.name}</p>
      <p><strong>{formatSoles(item.cents)} / día</strong>{item.regularCents && <> <del>{formatSoles(item.regularCents)}</del></>}</p>
      <p>Vigente del {item.starts.split('-').reverse().join('/')} al {item.ends.split('-').reverse().join('/')}. IGV incluido.</p>
      <details><summary>Bases de la promoción</summary><p className="promotion-terms">{item.terms}</p></details>
      <Link href={`${detailUrl(item.vehicleId)}#cotizador`} className="button accent">Cotizar</Link>
    </article>;
  })}</div>;
}
