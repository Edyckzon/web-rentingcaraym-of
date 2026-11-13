'use client';

import { useMarketing } from './MarketingProvider';
import { categorySlug } from '@/lib/catalog-profile';

export default function RentalSearch() {
  const { categories, fleet } = useMarketing();
  return <form className="rental-search" action="/flota/" aria-label="Buscar vehículos por fechas">
    <label>Tipo de vehículo<select name="tipo"><option value="">Todos</option>
      {categories.filter(name => name !== 'Todos' && fleet.some(vehicle => vehicle.categories.includes(name)))
        .map(name => <option key={name} value={categorySlug(name)}>{name}</option>)}
    </select></label>
    <label>Recojo<input name="recojo" type="datetime-local" required/></label>
    <label>Devolución<input name="devolucion" type="datetime-local" required/></label>
    <label>Lugar de entrega<select name="entrega"><option value="surco">Local Surco</option><option value="lima">Otro punto en Lima</option></select></label>
    <button className="button accent" type="submit">Ver precios</button>
  </form>;
}
