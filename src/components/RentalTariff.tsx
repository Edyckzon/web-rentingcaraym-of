'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, CarFront, Search, ShieldCheck } from 'lucide-react';
import { detailUrl, useCommercial, useMarketing } from './MarketingProvider';
import { defaultRentalRules, formatMoney, rateCurrency, promotionIsActive, startingRentalRates, minimumRatesByCurrency, type RentalPromotion, type RentalRules } from '@/lib/rental-pricing.mjs';
import type { Vehicle } from '@/lib/fleet';
import RentalPrice from './RentalPrice';
import ExchangeRate from './ExchangeRate';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const hasRates = (vehicle: Vehicle) => vehicle.rates?.daily != null || vehicle.rates?.weeklyPerDay != null || vehicle.rates?.monthly != null;

function TariffCard({ vehicle, rules, promotion }: { vehicle: Vehicle; rules: RentalRules; promotion?: RentalPromotion }) {
  const photo = vehicle.images[0];
  const detail = detailUrl(vehicle.id);
  const tiers = [
    { label: `1–${rules.weeklyFrom - 1} días`, cents: vehicle.rates?.daily, currency: rateCurrency(vehicle.rates, 'daily'), unit: 'día' },
    { label: `${rules.weeklyFrom}–${rules.monthlyFrom - 1} días`, cents: vehicle.rates?.weeklyPerDay, currency: rateCurrency(vehicle.rates, 'weeklyPerDay'), unit: 'día' },
    { label: `${rules.monthlyFrom} días o más`, cents: vehicle.rates?.monthly, currency: rateCurrency(vehicle.rates, 'monthly'), unit: 'mes' },
  ];
  return <article className="tariff-card" data-modelo={vehicle.id}>
    <div className="tariff-card-head">
      <div className="tariff-thumb">{photo ? <img src={photo.src} alt="" width={96} height={72} loading="lazy"/> : <CarFront size={27} aria-hidden="true"/>}</div>
      <div><p>{vehicle.category}</p><h3><Link href={detail}>{vehicle.name}</Link></h3></div>
    </div>
    {promotion && <div className="tariff-campaign">
      <strong>{promotion.title}</strong>
      <RentalPrice vehicleId={vehicle.id} rates={vehicle.rates}/>
    </div>}
    <dl className="tariff-tiers">{tiers.map(({ label, cents, currency, unit }) => <div key={label}>
      <dt>{label}</dt><dd>{cents == null ? <span>Por consultar</span> : <><strong>{formatMoney(cents, currency)}</strong><span> / {unit}</span></>}</dd>
    </div>)}</dl>
    <div className="tariff-card-foot">
      <p><ShieldCheck size={19} aria-hidden="true"/><span>Garantía aparte <strong>{vehicle.rates?.deposit == null ? 'Por consultar' : formatMoney(vehicle.rates.deposit, rateCurrency(vehicle.rates, 'deposit'))}</strong></span></p>
      <Link className="button accent" href={`${detail}#cotizador`} data-origen="tarifario" aria-label={`Cotizar ${vehicle.name}`}>Cotizar <ArrowRight size={16} aria-hidden="true"/></Link>
    </div>
  </article>;
}

export default function RentalTariff() {
  const { fleet } = useMarketing();
  const commercial = useCommercial();
  const rules = commercial?.rules ?? defaultRentalRules;
  const promotions = new Map(commercial?.promotions.filter(item => promotionIsActive(item)).map(item => [item.vehicleId, item]));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const categories = [...new Set(fleet.flatMap(vehicle => vehicle.categories))].sort((a, b) => a.localeCompare(b, 'es'));
  const visible = fleet.filter(vehicle => normalize(vehicle.name).includes(normalize(search)) && (!category || vehicle.categories.includes(category)));
  const priced = visible.filter(hasRates);
  const unpriced = visible.filter(vehicle => !hasRates(vehicle));
  const starting = minimumRatesByCurrency(fleet.flatMap(vehicle => {
    const rates = startingRentalRates(vehicle.rates, rules).map(rate => ({ ...rate, name: vehicle.name }));
    const promotion = promotions.get(vehicle.id);
    if (promotion) rates.push({ centsPerDay: promotion.cents, currency: promotion.currency ?? 'PEN', term: 'Promoción vigente', name: vehicle.name });
    return rates;
  }));

  return <>
    <section className="tariff-intro"><div className="container tariff-intro-grid">
      <div><p className="eyebrow">Alquiler en Lima</p><h1>Tarifario de alquiler</h1>
        <p>Compare los precios por modelo y duración. Cada tarifa indica su moneda: soles (S/) o dólares (US$). Los importes incluyen IGV.</p>
      </div>
      <div className="tariff-intro-price">
        <CalendarDays size={24} aria-hidden="true"/>
        {starting.length ? starting.map(rate => <div key={rate.currency}><p>Desde</p><p className="tariff-headline-price"><strong>{formatMoney(rate.centsPerDay, rate.currency)}</strong> <span>/ día</span></p>
          <p className="tariff-price-condition">{rate.name} · {rate.term}</p></div>)
          : <><strong>Tarifas por modelo</strong><p className="tariff-price-condition">Consulte el precio para sus fechas.</p></>}
      </div>
    </div></section>
    <section className="section tariff-content"><div className="container"><ExchangeRate/>
      <div className="tariff-filters">
        <label>Buscar modelo <span className="tariff-search-field"><Search size={18} aria-hidden="true"/>
          <input type="search" placeholder="Ej. Changan Alsvin" value={search} onChange={event => setSearch(event.target.value)}/></span>
        </label>
        <label>Categoría <select value={category} onChange={event => setCategory(event.target.value)}><option value="">Todas las categorías</option>
          {categories.map(name => <option key={name} value={name}>{name}</option>)}</select>
        </label>
        <p role="status">{visible.length} {visible.length === 1 ? 'modelo' : 'modelos'}</p>
      </div>
      {visible.length === 0 && <div className="tariff-empty"><p>No encontramos modelos con estos filtros.</p>
        <button type="button" className="button secondary" onClick={() => { setSearch(''); setCategory(''); }}>Limpiar filtros</button></div>}
      {priced.length > 0 && <section aria-labelledby="tariff-listed"><div className="tariff-section-title"><h2 id="tariff-listed">Tarifas por duración</h2>
        <Link href="/requisitos/">Ver requisitos de alquiler <ArrowRight size={16} aria-hidden="true"/></Link></div>
        <div className="tariff-card-grid">{priced.map(vehicle => <TariffCard key={vehicle.id} vehicle={vehicle} rules={rules} promotion={promotions.get(vehicle.id)}/>)}</div>
      </section>}
      {unpriced.length > 0 && <section className="tariff-unlisted" aria-labelledby="tariff-unlisted">
        <h2 id="tariff-unlisted">Modelos con tarifa a consultar</h2>
        <p>Indique sus fechas en la ficha para solicitar el precio y confirmar disponibilidad.</p>
        <ul className="tariff-unlisted-grid">{unpriced.map(vehicle => <li key={vehicle.id} data-modelo={vehicle.id}>
          <Link href={`${detailUrl(vehicle.id)}#cotizador`} data-origen="tarifario" aria-label={`Consultar tarifa de ${vehicle.name}`}>
            <span><strong>{vehicle.name}</strong><small>{vehicle.category}</small></span><ArrowRight size={18} aria-hidden="true"/>
          </Link>
        </li>)}</ul>
      </section>}
    </div></section>
  </>;
}
