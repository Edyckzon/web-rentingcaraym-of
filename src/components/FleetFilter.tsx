'use client';
import {useMarketing} from '@/components/MarketingProvider';


import { useState } from 'react';

import { VehicleCard } from './Catalog';

export default function FleetFilter() {
  const {categories,fleet}=useMarketing();
  const [category, setCategory] = useState<(typeof categories)[number]>('Todos');
  const vehicles = fleet.filter(vehicle => category === 'Todos' || vehicle.category === category);
  return <><div className="fleet-toolbar"><div className="tabs" role="group" aria-label="Filtrar vehículos por categoría">{categories.map(item => <button type="button" key={item} className={`tab${category === item ? ' active' : ''}`} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><p className="result-count" role="status">{vehicles.length} {vehicles.length === 1 ? 'modelo' : 'modelos'}</p></div><div className="vehicle-grid">{vehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle}/>)}</div></>;
}
