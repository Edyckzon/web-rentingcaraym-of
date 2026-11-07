import ManagedIntro from '@/components/ManagedIntro';
import { ServiceCards } from '@/components/Catalog';
import { Closing, PageIntro, WhyUs } from '@/components/Sections';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('Maquinaria y transporte de carga', 'Excavadora CAT 330DL, volquetes y transporte de carga con camiones Volvo y Scania. Solicite su cotización con Renting Car A&M.', '/maquinaria-y-transporte/');
export default function HeavyPage() {
  return <><ManagedIntro path="/maquinaria-y-transporte/" label="Nuestra línea pesada"/><section className="section soft"><div className="container"><ServiceCards/><p className="section-note">Consulte capacidad, disponibilidad de operador o conductor, rutas y movilización al solicitar su propuesta. Fotografías referenciales.</p></div></section><WhyUs/><Closing/></>;
}
