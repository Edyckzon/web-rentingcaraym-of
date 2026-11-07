import ManagedIntro from '@/components/ManagedIntro';
import FleetFilter from '@/components/FleetFilter';
import { Closing, PageIntro } from '@/components/Sections';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('Alquiler de camionetas y autos en Lima', 'Explore SUV, sedanes y vehículos familiares de Renting Car A&M. Elija su modelo y solicite una cotización personalizada.', '/flota/');

export default function FleetPage() {
  return <><ManagedIntro path="/flota/" label="Flota de vehículos"/><section className="section catalog-section soft"><div className="container"><FleetFilter/><p className="section-note">Las imágenes identificadas como referenciales no representan las unidades ofrecidas. Consulte versión, características y disponibilidad al cotizar.</p><section className="prose"><h2>Alquiler de camionetas y autos en Lima</h2><p>En Renting Car A&M atendemos necesidades de movilidad personal, familiar y empresarial desde Santiago de Surco. Explore las categorías del catálogo, compare los modelos disponibles e indique sus fechas y el número de pasajeros. Nuestro equipo le ayudará a confirmar la configuración de la unidad, el lugar de recojo y las condiciones del servicio antes de contratar.</p></section></div></section><Closing/></>;
}
