import FleetFilter from '@/components/FleetFilter';
import { Closing, PageIntro } from '@/components/Sections';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('Alquiler de camionetas y autos en Lima', 'Explore SUV, sedanes y vehículos familiares de Renting Car A&M. Elija su modelo y solicite una cotización personalizada.', '/flota/');

export default function FleetPage() {
  return <><PageIntro label="Flota de vehículos" title="Nuestra flota" description="SUV, sedanes y vehículos familiares para su movilidad personal o empresarial."/><section className="section catalog-section soft"><div className="container"><FleetFilter/><p className="section-note">Las imágenes identificadas como referenciales no representan las unidades ofrecidas. Consulte versión, características y disponibilidad al cotizar.</p></div></section><Closing/></>;
}
