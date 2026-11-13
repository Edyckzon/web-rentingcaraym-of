export type CatalogProfile = {
  year: number | null;
  transmission: string;
  fuel: string;
  seats: number | null;
  traction: string;
  engine: string;
  luggage: string;
  includedKm: number | null;
};

export const emptyCatalogProfile: CatalogProfile = {
  year: null, transmission: '', fuel: '', seats: null,
  traction: '', engine: '', luggage: '', includedKm: null,
};

export const fleetCategories = [
  { slug: 'suv', name: 'SUV', title: 'Alquiler de camionetas SUV en Lima', description: 'Compare camionetas SUV para traslados familiares, personales y de trabajo. Revise plazas, combustible y tarifas por modelo.' },
  { slug: 'pickup-4x4', name: 'Pickup 4x4', title: 'Alquiler de pickups 4x4 en Lima', description: 'Consulte las pickups 4x4 disponibles para su proyecto. Confirme las características de la unidad y las condiciones del recorrido.' },
  { slug: '7-asientos', name: 'Familiar / 7 asientos', title: 'Alquiler de autos de 7 asientos en Lima', description: 'Compare vehículos familiares para viajar con más acompañantes. Confirme el espacio para equipaje y la configuración de la unidad.' },
  { slug: 'sedan', name: 'Sedán', title: 'Alquiler de autos sedán en Lima', description: 'Explore sedanes para sus traslados en Lima. Compare transmisión, combustible y condiciones del alquiler.' },
] as const;

export function categorySlug(name: string) {
  return fleetCategories.find(category => category.name === name)?.slug ?? name;
}
