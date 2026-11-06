import snapshot from './marketing-public.json';
import type { CatalogImage } from './media';
import { technicalSheets, type TechnicalSheet } from './technicalSheets';
import { fleetDetails } from './fleetDetails';

export type Category = string;
export type Vehicle = {
  id: string;
  name: string;
  category: Category;
  description: string;
  images: CatalogImage[];
  referenceSheet?: TechnicalSheet;
  // Incorporar únicamente especificaciones y tarifas aprobadas de la unidad real.
  specifications?: { label: string; value: string }[];
  dailyRate?: number;
};

// Los archivos originales del catálogo se sirven desde Supabase Storage.
export const baseFleet: Vehicle[] = snapshot.listings.map(model => {
  const details = fleetDetails[model.id];
  const sheet = technicalSheets[model.id];
  return {
    id: model.id, name: model.name, category: model.category, description: model.description,
    referenceSheet: sheet && {...sheet, ...(details && {year: details.year, transmission: details.transmission})},
    specifications: details ? [{label: 'Combustible', value: details.fuel}] : [],
    images: model.images.map(src => {
      const photo = snapshot.photos.find(p => p.src === src);
      return {src, alt: photo?.alt ?? model.name, reference: photo?.reference,
        credit: photo?.credit ?? undefined, sourceUrl: photo?.sourceUrl ?? undefined,
        license: photo?.license ?? undefined, licenseUrl: photo?.licenseUrl ?? undefined};
    }),
  };
});
export const fleet = baseFleet;
export const featuredFleet = fleet.filter(v => snapshot.listings.some(row => row.id === v.id && row.featured));

export const vehicleMessage = (vehicle: Vehicle) => `Hola, deseo cotizar el alquiler de un ${vehicle.name}. Quisiera coordinar fechas, lugar de recojo y disponibilidad.`;
