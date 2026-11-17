import { referenceImages, type CatalogImage } from './media';
import snapshot from './marketing-public.json';
export type ServicePhoto = {serviceId:string;src:string;alt:string};

export type HeavyService = {
  id: string; name: string; equipment: string; description: string;
  applications: string[]; quoteFields: string[]; message: string;
  images: CatalogImage[];
  specifications?: { label: string; value: string }[];
  guidanceTitle?:string;guidanceIntro?:string;conditions?:string;
};
export type ServiceContent=Omit<HeavyService,'images'|'specifications'>;

export const baseHeavyServices: HeavyService[] = [
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

export const baseServicePages:HeavyService[]=[
  {id:'empresas',name:'Alquiler para empresas',equipment:'Movilidad empresarial',description:'Coordine la cantidad de unidades y el plazo de alquiler para su equipo.',applications:[],quoteFields:[],message:'Hola, deseo cotizar un alquiler para empresas.',images:[]},
  {id:'maquinaria-y-transporte',name:'Maquinaria y transporte',equipment:'Línea pesada',description:'Excavadora CAT 330DL, volquetes y transporte de carga en Lima. Consulte operador, movilización y condiciones para su proyecto.',applications:[],quoteFields:[],message:'Hola, deseo cotizar maquinaria o transporte de carga.',images:[]},
  ...baseHeavyServices,
];
export function withServicePhotos(photos:ServicePhoto[],contents:ServiceContent[]=[]) {
  return baseServicePages.map(base=>{
    const service={...base,...contents.find(item=>item.id===base.id)};
    const images=photos.filter(photo=>photo.serviceId===service.id).map(photo=>({src:photo.src,alt:photo.alt,reference:false}));
    return {...service,images:images.length?images:service.images};
  });
}
const initial=snapshot as {servicePhotos?:ServicePhoto[];serviceContent?:ServiceContent[]};
export const allServicePages=withServicePhotos(initial.servicePhotos??[],initial.serviceContent??[]);
export const heavyServices=allServicePages.filter(service=>baseHeavyServices.some(base=>base.id===service.id));
