'use client';

import { useMarketing } from './MarketingProvider';
import { categorySlug } from '@/lib/catalog-profile';
import { useState } from 'react';
import { validateRentalDates } from '@/lib/rental-pricing.mjs';
import { useRentalDateBounds } from './useRentalDateBounds';

export default function RentalSearch() {
  const { categories, fleet } = useMarketing();
  const [pickup, setPickup] = useState('');
  const [error, setError] = useState('');
  const { pickupMin, returnMin } = useRentalDateBounds(pickup);
  return <form className="rental-search" action="/flota/" aria-label="Buscar vehículos por fechas" onChange={() => setError('')} onSubmit={event => {
    const fields = new FormData(event.currentTarget);
    try { validateRentalDates(String(fields.get('recojo')), String(fields.get('devolucion'))); }
    catch (cause) { event.preventDefault(); setError(cause instanceof Error ? cause.message : 'Revise las fechas.'); }
  }}>
    <label>Tipo de vehículo<select name="tipo"><option value="">Todos</option>
      {categories.filter(name => name !== 'Todos' && fleet.some(vehicle => vehicle.categories.includes(name)))
        .map(name => <option key={name} value={categorySlug(name)}>{name}</option>)}
    </select></label>
    <label>Recojo<input name="recojo" type="datetime-local" min={pickupMin} value={pickup} onChange={event => setPickup(event.target.value)} required/></label>
    <label>Devolución<input name="devolucion" type="datetime-local" min={returnMin} required/></label>
    <label>Lugar de entrega<select name="entrega"><option value="surco">Local Surco</option><option value="lima">Otro punto en Lima</option></select></label>
    <button className="button accent" type="submit">Ver precios</button>
    {error && <p role="alert">{error}</p>}
  </form>;
}
