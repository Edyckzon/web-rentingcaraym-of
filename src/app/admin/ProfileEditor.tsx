'use client';

import { useEffect, useState } from 'react';
import type { Listing } from '@/lib/marketing';
import { emptyCatalogProfile, type CatalogProfile } from '@/lib/catalog-profile';
import { fleetDetails } from '@/lib/fleetDetails';

export type ProfileChange = {
  id: string;
  profile: CatalogProfile;
  categories: string[];
  published: boolean;
};

export default function ProfileEditor({ vehicles, categories, onSave, onDirtyChange }: {
  vehicles: Listing[];
  categories: string[];
  onSave: (name: string, change: ProfileChange) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [id, select] = useState('');
  const vehicle = vehicles.find(item => item.id === id) ?? vehicles[0];
  if (!vehicle) return <p>Agregue un vehículo para editar su ficha técnica.</p>;
  return <ProfileForm key={JSON.stringify([vehicle.id, vehicle.profile, vehicle.additionalCategories, vehicle.published])}
    vehicle={vehicle} vehicles={vehicles} categories={categories} onSelect={select}
    onSave={onSave} onDirtyChange={onDirtyChange}/>;
}

function ProfileForm({ vehicle, vehicles, categories, onSelect, onSave, onDirtyChange }: {
  vehicle: Listing;
  vehicles: Listing[];
  categories: string[];
  onSelect: (id: string) => void;
  onSave: (name: string, change: ProfileChange) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const savedProfile = { ...emptyCatalogProfile, ...fleetDetails[vehicle.id], ...vehicle.profile };
  const [profile, setProfile] = useState(savedProfile);
  const [extraCategories, setExtraCategories] = useState(vehicle.additionalCategories ?? []);
  const [published, setPublished] = useState(vehicle.published !== false);
  const dirty = JSON.stringify(profile) !== JSON.stringify(savedProfile)
    || JSON.stringify(extraCategories) !== JSON.stringify(vehicle.additionalCategories ?? [])
    || published !== (vehicle.published !== false);

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  return <form onSubmit={event => {
    event.preventDefault();
    onSave(vehicle.name, { id: vehicle.id, profile, categories: extraCategories, published });
  }}><fieldset><section>
    <label>Vehículo<select disabled={dirty} value={vehicle.id} onChange={event => onSelect(event.target.value)}>
      {vehicles.map(item => <option key={item.id} value={item.id}>{item.name}{item.published === false ? ' · Borrador' : ''}</option>)}
    </select></label>
    <h2>Datos confirmados de la unidad</h2>
    <p>Deje vacíos los datos que aún debe confirmar con Operaciones.</p>
    <div className="rate-admin-grid">
      {([['year','Año',1900,2100],['seats','Pasajeros',1,100],['includedKm','Kilometraje incluido',0,1000000]] as const).map(([key,label,min,max]) =>
        <label key={key}>{label}<input type="number" min={min} max={max} required={key === 'year' && published}
          value={profile[key] ?? ''} onChange={event => setProfile({ ...profile, [key]: event.target.value ? Number(event.target.value) : null })}/></label>)}
      {([['transmission','Transmisión'],['fuel','Combustible'],['traction','Tracción'],['engine','Motor'],['luggage','Maletera']] as const).map(([key,label]) =>
        <label key={key}>{label}<input maxLength={100} value={profile[key]}
          onChange={event => setProfile({ ...profile, [key]: event.target.value })}/></label>)}
    </div>
    <h3>Categorías</h3>
    <p>Principal: {vehicle.category}. Puede incluir el mismo vehículo en otras categorías.</p>
    {[...new Set([...categories, 'Pickup 4x4'])].filter(name => name !== vehicle.category).map(name => <label key={name} className="check">
      <input type="checkbox" checked={extraCategories.includes(name)} onChange={event => setExtraCategories(
        event.target.checked ? [...extraCategories, name].sort() : extraCategories.filter(item => item !== name),
      )}/>{name}
    </label>)}
    <label className="check"><input type="checkbox" checked={published} onChange={event => setPublished(event.target.checked)}/> Mostrar en el catálogo</label>
    <div className="actions"><button type="submit" className="gold" disabled={!dirty}>Guardar ficha</button>
      <button type="button" disabled={!dirty} onClick={() => {
        setProfile(savedProfile);
        setExtraCategories(vehicle.additionalCategories ?? []);
        setPublished(vehicle.published !== false);
      }}>Descartar cambios</button></div>
  </section></fieldset></form>;
}
