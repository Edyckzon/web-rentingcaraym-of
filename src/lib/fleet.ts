import { referenceImages, type CatalogImage } from './media';
import { technicalSheets, type TechnicalSheet } from './technicalSheets';

export const categories = ['Todos', 'SUV', 'Sedán', 'Familiar / 7 asientos'] as const;
export type Category = Exclude<(typeof categories)[number], 'Todos'>;
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

// Las fotos se muestran en el orden del modelo; la primera también es la portada.
type Model = Omit<Vehicle, 'description' | 'images'> & Partial<Pick<Vehicle, 'description' | 'images'>>;
const models: Model[] = [
  { id: 'ford-territory', name: 'Ford Territory', category: 'SUV' },
  { id: 'geely-okavango', name: 'Geely Okavango', category: 'SUV' },
  {
    id: 'changan-x7-plus', name: 'Changan X7 Plus', category: 'SUV',
    images: [
      ['5.png', 'Changan X7 Plus gris de Renting Car A&M, vista frontal de tres cuartos'],
      ['4.png', 'Changan X7 Plus gris, vista frontal desde el lado opuesto'],
      ['6.png', 'Changan X7 Plus, detalle de la parte posterior'],
      ['7.png', 'Changan X7 Plus, rueda y aro de aleación'],
      ['8.png', 'Changan X7 Plus, volante y tablero'],
      ['9.png', 'Changan X7 Plus, controles de ventanas en la puerta'],
      ['10.png', 'Changan X7 Plus, selector de cambios y consola central'],
      ['11.png', 'Changan X7 Plus, pantalla multimedia y climatización'],
      ['12.png', 'Changan X7 Plus, controles del techo'],
      ['13.png', 'Changan X7 Plus, asientos delanteros'],
      ['14.png', 'Changan X7 Plus, asientos posteriores'],
      ['15.png', 'Changan X7 Plus, maletero y tercera fila'],
      ['16.png', 'Changan X7 Plus, compartimento bajo el piso del maletero'],
      ['1 portada.png', 'Changan X7 Plus gris sobre fondo de estudio'],
      ['2.png', 'Changan X7 Plus gris, vista frontal sobre fondo blanco'],
      ['3.png', 'Changan X7 Plus gris, vista lateral sobre fondo blanco'],
    ].map(([file, alt]) => ({ src: encodeURI(`/images/Changan x7 plus (1600x1000)/${file}`), alt, reference: false })),
  },
  { id: 'changan-cx70', name: 'Changan CX70', category: 'SUV' },
  { id: 'jetur-x70', name: 'Jetour X70', category: 'SUV' },
  { id: 'glory-580', name: 'Glory 580', category: 'SUV' },
  { id: 'glory-560', name: 'Glory 560', category: 'SUV' },
  { id: 'jac-s8', name: 'JAC JS8', category: 'SUV' },
  { id: 'toyota-yaris', name: 'Toyota Yaris', category: 'Sedán' },
  { id: 'hyundai-verna', name: 'Hyundai Verna', category: 'Sedán' },
  { id: 'hyundai-accent', name: 'Hyundai Accent', category: 'Sedán' },
  { id: 'changan-alsvin', name: 'Changan Alsvin', category: 'Sedán' },
  {
    id: 'suzuki-ertiga', name: 'Suzuki Ertiga', category: 'Familiar / 7 asientos',
    images: [
      { src: '/images/Suzuki%20Ertiga%20(1600x1000)/5.png', alt: 'Suzuki Ertiga blanca de Renting Car A&M, vista frontal de tres cuartos', reference: false },
      { src: '/images/Suzuki%20Ertiga%20(1600x1000)/4.png', alt: 'Suzuki Ertiga blanca, vista frontal desde el lado opuesto', reference: false },
      { src: '/images/Suzuki%20Ertiga%20(1600x1000)/6.png', alt: 'Suzuki Ertiga blanca, vista posterior de tres cuartos', reference: false },
      { src: '/images/Suzuki%20Ertiga%20(1600x1000)/1.png', alt: 'Suzuki Ertiga blanca, vista de tres cuartos sobre fondo de estudio', reference: false },
      { src: '/images/Suzuki%20Ertiga%20(1600x1000)/2.png', alt: 'Suzuki Ertiga blanca, vista frontal sobre fondo blanco', reference: false },
      { src: '/images/Suzuki%20Ertiga%20(1600x1000)/3.png', alt: 'Suzuki Ertiga blanca, vista lateral sobre fondo blanco', reference: false },
    ],
  },
];

export const fleet: Vehicle[] = models.map(model => ({
  ...model,
  referenceSheet: technicalSheets[model.id],
  description: model.description ?? `Solicite una cotización para el alquiler de ${model.name}. Nuestro equipo le ayudará a coordinar las fechas, el lugar de recojo y las condiciones del servicio.`,
  images: model.images?.length ? model.images : [model.category === 'Sedán' ? referenceImages.sedan : referenceImages.suv],
}));

export const featuredFleet = ['ford-territory', 'changan-x7-plus', 'changan-cx70', 'jetur-x70', 'toyota-yaris', 'suzuki-ertiga']
  .map(id => fleet.find(vehicle => vehicle.id === id)!);

export const vehicleMessage = (vehicle: Vehicle) => `Hola, deseo cotizar el alquiler de un ${vehicle.name}. Quisiera coordinar fechas, lugar de recojo y disponibilidad.`;
