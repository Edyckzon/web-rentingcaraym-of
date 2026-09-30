import { referenceImages, type CatalogImage } from './media';

export const categories = ['Todos', 'SUV', 'Sedán', 'Familiar / 7 asientos'] as const;
export type Category = Exclude<(typeof categories)[number], 'Todos'>;
export type Vehicle = {
  id: string;
  name: string;
  category: Category;
  description: string;
  images: CatalogImage[];
  // Incorporar únicamente especificaciones y tarifas aprobadas de la unidad real.
  specifications?: { label: string; value: string }[];
  dailyRate?: number;
};

const models: { id: string; name: string; category: Category }[] = [
  { id: 'ford-territory', name: 'Ford Territory', category: 'SUV' },
  { id: 'changan-x7-plus', name: 'Changan X7 Plus', category: 'SUV' },
  { id: 'changan-cx70', name: 'Changan CX70', category: 'SUV' },
  { id: 'jetur-x70', name: 'Jetur X70', category: 'SUV' },
  { id: 'glory-580', name: 'Glory 580', category: 'SUV' },
  { id: 'glory-560', name: 'Glory 560', category: 'SUV' },
  { id: 'jac-s8', name: 'JAC S8', category: 'SUV' },
  { id: 'toyota-yaris', name: 'Toyota Yaris', category: 'Sedán' },
  { id: 'hyundai-verna', name: 'Hyundai Verna', category: 'Sedán' },
  { id: 'hyundai-accent', name: 'Hyundai Accent', category: 'Sedán' },
  { id: 'changan-alsvin', name: 'Changan Alsvin', category: 'Sedán' },
  { id: 'suzuki-ertiga', name: 'Suzuki Ertiga', category: 'Familiar / 7 asientos' },
];

export const fleet: Vehicle[] = models.map(model => ({
  ...model,
  description: `Solicite una cotización para el alquiler de ${model.name}. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.`,
  images: [model.category === 'Sedán' ? referenceImages.sedan : referenceImages.suv],
}));

export const featuredFleet = ['ford-territory', 'changan-x7-plus', 'changan-cx70', 'jetur-x70', 'toyota-yaris', 'suzuki-ertiga']
  .map(id => fleet.find(vehicle => vehicle.id === id)!);

export const vehicleMessage = (vehicle: Vehicle) => `Hola, deseo cotizar el alquiler de un ${vehicle.name}. Quisiera coordinar fechas, lugar de recojo y disponibilidad.`;
