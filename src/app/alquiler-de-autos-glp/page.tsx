import FleetFilter from '@/components/FleetFilter';
import BreadcrumbData from '@/components/BreadcrumbData';
import { Closing, PageIntro } from '@/components/Sections';
import { pageMetadata } from '@/lib/seo';

const title = 'Alquiler de autos a GLP en Lima';
const description = 'Compare modelos bicombustibles y consulte qué unidad está disponible para sus fechas, recorrido y lugar de recojo.';
const path = '/alquiler-de-autos-glp/';
export const metadata = pageMetadata(title, description, path);

export default function GlpPage() {
  return <><BreadcrumbData trail={[{ name: 'Flota', path: '/flota/' }, { name: 'Autos a GLP', path }]}/>
    <PageIntro label="Vehículos bicombustibles" title={title} description={description}/>
    <section className="section soft"><div className="container"><FleetFilter fuel="glp"/></div></section><Closing/></>;
}
