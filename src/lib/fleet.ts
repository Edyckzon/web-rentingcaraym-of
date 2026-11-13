import type { RentalRates } from './rental-pricing.mjs';
import type { Listing } from './marketing';
import snapshot from './marketing-public.json';
import type { CatalogImage } from './media';
import { emptyCatalogProfile, type CatalogProfile } from './catalog-profile';
import { fleetDetails } from './fleetDetails';

export type Category = string;
export type Vehicle = {
  id: string;
  name: string;
  category: Category;
  description: string;
  images: CatalogImage[];
  profile: CatalogProfile;
  categories: string[];
  // Incorporar únicamente especificaciones y tarifas aprobadas de la unidad real.
  specifications?: { label: string; value: string }[];
  rates?: RentalRates;
  seoTitle?: string; seoDescription?: string; idealFor?: string; updatedAt?: string;
};

export function vehicleFromListing(model: Listing, photos: CatalogImage[]): Vehicle {
  const profile = { ...emptyCatalogProfile, ...fleetDetails[model.id], ...model.profile };
  const specs: [string, string][] = [
    ['Año', String(profile.year ?? '')], ['Transmisión', profile.transmission], ['Combustible', profile.fuel],
    ['Pasajeros', String(profile.seats ?? '')], ['Tracción', profile.traction], ['Motor', profile.engine],
    ['Maletera', profile.luggage], ['Kilometraje incluido', profile.includedKm === null ? '' : `${profile.includedKm} km`],
  ];
  return {
    ...model,
    profile,
    categories: [...new Set([model.category, ...(model.additionalCategories ?? [])])],
    specifications: specs.filter(([, value]) => value).map(([label, value]) => ({ label, value })),
    images: model.images.flatMap(src => {
      const photo = photos.find(item => item.src === src);
      return photo?.reference === false && !photo.sourceUrl ? [photo] : [];
    }),
  };
}

export const baseFleet: Vehicle[] = (snapshot.listings as Listing[])
  .filter(model => model.published !== false)
  .map(model => vehicleFromListing(model, snapshot.photos));
export const fleet = baseFleet;
export const featuredFleet = fleet.filter(v => snapshot.listings.some(row => row.id === v.id && row.featured));

export const vehicleMessage = (vehicle: Vehicle) => `Hola, deseo cotizar el alquiler de un ${vehicle.name}. Quisiera coordinar fechas, lugar de recojo y disponibilidad.`;
