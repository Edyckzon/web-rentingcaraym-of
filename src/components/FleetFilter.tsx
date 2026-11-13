'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCommercial, useMarketing } from '@/components/MarketingProvider';
import { categorySlug, fleetCategories } from '@/lib/catalog-profile';
import { promotionIsActive, startingRentalRate } from '@/lib/rental-pricing.mjs';
import { trackEvent } from '@/lib/analytics';
import { VehicleCard } from './Catalog';

const options = [
  ['caja', 'Transmisión', [['automatica', 'Automática'], ['mecanica', 'Mecánica']]],
  ['combustible', 'Combustible', [['glp', 'GLP'], ['gasolina', 'Gasolina'], ['diesel', 'Diésel']]],
  ['traccion', 'Tracción', [['4x4', '4x4']]],
  ['pasajeros', 'Pasajeros', [['5', '5 plazas'], ['7', '7 plazas']]],
  ['orden', 'Orden', [['precio', 'Menor precio'], ['ano', 'Más recientes']]],
] as const;
const fold = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function FleetFilter({ category, fuel }: { category?: string; fuel?: string }) {
  const { categories, fleet } = useMarketing();
  const commercial = useCommercial();
  const promoted = new Map(commercial?.promotions.filter(item => promotionIsActive(item)).map(item => [item.vehicleId, item.cents]));
  const [search, setSearch] = useState('');
  useEffect(() => {
    function read() { setSearch(window.location.search); }
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  const params = new URLSearchParams(search);
  const type = category ? categorySlug(category) : params.get('tipo') ?? '';
  const selected = Object.fromEntries(options.map(([key, , choices]) => {
    const value = params.get(key) ?? '';
    return [key, choices.some(([id]) => id === value) ? value : ''];
  }));
  const visible = fleet.filter(vehicle => {
    const profile = vehicle.profile;
    return (!type || vehicle.categories.some(name => categorySlug(name) === type))
      && (!selected.caja || fold(profile.transmission).includes(selected.caja))
      && (!(fuel || selected.combustible) || fold(profile.fuel).includes(fuel || selected.combustible))
      && (!selected.traccion || fold(profile.traction).includes(selected.traccion))
      && (!selected.pasajeros || profile.seats === Number(selected.pasajeros));
  });
  visible.sort((a, b) => {
    if (selected.orden === 'precio') {
      const left = promoted.get(a.id) ?? startingRentalRate(a.rates, commercial?.rules)?.centsPerDay ?? Infinity;
      const right = promoted.get(b.id) ?? startingRentalRate(b.rates, commercial?.rules)?.centsPerDay ?? Infinity;
      if (left !== right) return left - right;
    }
    if (!selected.orden && promoted.has(a.id) !== promoted.has(b.id)) return promoted.has(a.id) ? -1 : 1;
    return (b.profile.year ?? 0) - (a.profile.year ?? 0) || a.name.localeCompare(b.name, 'es');
  });

  function apply(changes: Record<string, string>) {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
    setSearch(query);
    for (const [key, value] of Object.entries(changes)) {
      if (value) trackEvent('filtro_uso', { filtro: key, valor: value });
    }
  }
  const hasFilters = (!category && type) || Object.values(selected).some(Boolean);
  const clear = () => apply(Object.fromEntries(['tipo', ...options.map(([key]) => key)].map(key => [key, ''])));

  return <>
    {!category && <div className="tabs catalog-tabs" role="group" aria-label="Categoría de vehículo">
      {categories.map(name => {
        const slug = name === 'Todos' ? '' : categorySlug(name);
        const count = fleet.filter(vehicle => (!fuel || fold(vehicle.profile.fuel).includes(fuel)) && (name === 'Todos' || vehicle.categories.includes(name))).length;
        return <button key={name} type="button" className={`tab${type === slug ? ' active' : ''}`}
          aria-pressed={type === slug} onClick={() => apply({ tipo: slug })}>{name} <span>({count})</span></button>;
      })}
    </div>}
    <div className="catalog-filters" aria-label="Filtros de flota">{options.filter(([key]) => !fuel || key !== 'combustible').map(([key, label, choices]) =>
      <label key={key}>{label}<select value={selected[key]} onChange={event => apply({ [key]: event.target.value })}>
        <option value="">{key === 'orden' ? 'Predeterminado' : 'Cualquiera'}</option>
        {choices.map(([value, name]) => <option key={value} value={value}>{name}</option>)}
      </select></label>,
    )}</div>
    <div className="fleet-toolbar">
      <p className="result-count" role="status">{visible.length} {visible.length === 1 ? 'modelo' : 'modelos'}</p>
      {hasFilters && <button className="button secondary" type="button" onClick={clear}>Limpiar filtros</button>}
    </div>
    {visible.length ? <div className="vehicle-grid">{visible.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} dates={{
      pickup: params.get('recojo') ?? '', dropoff: params.get('devolucion') ?? '', place: params.get('entrega') ?? '',
    }}/>)}</div> : <p className="catalog-empty">{hasFilters ? 'No hay unidades con esos filtros.' : 'No hay unidades publicadas en esta categoría.'}</p>}
    {!category && <nav className="catalog-category-links" aria-label="Páginas de categorías">
      {fleetCategories.filter(item => fleet.some(vehicle => vehicle.categories.includes(item.name))).map(item =>
        <Link key={item.slug} href={`/flota/${item.slug}/`}>{item.name}</Link>,
      )}
    </nav>}
  </>;
}
