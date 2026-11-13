import ManagedIntro from '@/components/ManagedIntro';
import FleetFilter from '@/components/FleetFilter';
import ServicePrice from '@/components/ServicePrice';
import {Closing} from '@/components/Sections';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Alquiler de camionetas para empresas','Alquiler de camionetas y autos para empresas en Lima. Atención desde Santiago de Surco. Solicite su propuesta.','/alquiler-para-empresas/');
export default function CompaniesPage(){return <>
 <ManagedIntro path="/alquiler-para-empresas/" label="Movilidad empresarial"/>
 <section className="section container"><div className="benefits-grid company-benefits">
  <article><h2>Una propuesta para su operación</h2><p>Indique cuántas unidades necesita, las fechas y el uso previsto. Coordinamos la disponibilidad y las condiciones para su equipo.</p></article>
  <article><h2>Plazos según su proyecto</h2><p>Comparta la duración estimada del servicio para evaluar las modalidades disponibles y preparar su cotización.</p><ServicePrice service="empresas"/></article>
  <article><h2>Taller propio en Surco</h2><p>Contamos con taller de reparación en nuestra sede de Santiago de Surco. Consulte la coordinación del mantenimiento de las unidades.</p></article>
  <article><h2>Atención directa</h2><p>Converse con nuestro equipo sobre requisitos, documentación y condiciones de contratación para su empresa.</p></article>
 </div></section><section className="section soft"><div className="container"><div className="section-heading"><h2>Flota disponible para empresas</h2></div><FleetFilter/></div></section><Closing/>
 </>;}
