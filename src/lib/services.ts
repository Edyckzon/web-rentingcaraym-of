import { referenceImages, type CatalogImage } from './media';

export type HeavyService = {
  id: string; name: string; equipment: string; description: string;
  applications: string[]; quoteFields: string[]; message: string;
  images: CatalogImage[];
  specifications?: { label: string; value: string }[];
};

export const heavyServices: HeavyService[] = [
  {
    id: 'excavadora-cat-330dl', name: 'Alquiler de excavadora', equipment: 'CAT 330DL',
    description: 'Maquinaria para sus proyectos de excavación y movimiento de tierras. Cuéntenos el trabajo y la ubicación de su obra para preparar una propuesta.',
    applications: ['Excavación y zanjas', 'Movimiento de tierras', 'Carga de volquetes'],
    quoteFields: ['Ubicación y acceso a la obra', 'Tipo de trabajo y accesorios requeridos', 'Fecha de inicio y duración estimada', 'Necesidad de operador y movilización'],
    message: 'Hola, deseo cotizar el alquiler de la excavadora CAT 330DL. Quisiera coordinar la obra, fecha de inicio y disponibilidad de operador.',
    images: [referenceImages.excavator],
  },
  {
    id: 'volquetes', name: 'Alquiler de volquetes', equipment: 'Volquetes',
    description: 'Solicite volquetes para el traslado de materiales y apoyo a su obra. Indique el volumen, el tipo de material y el recorrido requerido.',
    applications: ['Eliminación de desmonte', 'Traslado de agregados', 'Apoyo a obras'],
    quoteFields: ['Tipo y volumen de material', 'Cantidad de unidades requerida', 'Origen, destino y acceso a la obra', 'Fecha de inicio y duración estimada'],
    message: 'Hola, deseo cotizar el alquiler de volquetes. Quisiera indicar la cantidad de unidades, el material y la ubicación de la obra.',
    images: [referenceImages.volquete],
  },
  {
    id: 'transporte-de-carga', name: 'Transporte de carga', equipment: 'Volvo y Scania',
    description: 'Transporte con camiones y tractos Volvo y Scania. Comparta las características de su carga y la ruta para evaluar el servicio que necesita.',
    applications: ['Carga general', 'Mercancías', 'Materiales de construcción'],
    quoteFields: ['Origen y destino', 'Tipo, peso y dimensiones de la carga', 'Fecha de traslado', 'Condiciones de carga y descarga'],
    message: 'Hola, deseo cotizar un transporte de carga con camiones Volvo y Scania. Quisiera coordinar origen, destino y tipo de carga.',
    images: [referenceImages.truck],
  },
];
