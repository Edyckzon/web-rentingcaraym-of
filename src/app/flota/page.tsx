import ManagedIntro from '@/components/ManagedIntro';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import FleetFilter from '@/components/FleetFilter';
import { Closing } from '@/components/Sections';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('Alquiler de camionetas y autos en Lima', 'Explore SUV, sedanes y vehículos familiares de Renting Car A&M. Elija su modelo y solicite una cotización personalizada.', '/flota/');

export default function FleetPage() {
  return <><ManagedIntro path="/flota/" label="Flota de vehículos"/><section className="section catalog-section soft"><div className="container"><section className="tariff-entry" id="tarifario" aria-labelledby="tariff-entry-title"><div><h2 id="tariff-entry-title">Tarifas por modelo</h2><p>Compare precios por duración y la garantía de cada vehículo.</p></div><Link href="/tarifario/" className="button accent">Abrir tarifario <ArrowRight size={17} aria-hidden="true"/></Link></section><FleetFilter/><section className="prose"><h2>Alquiler de camionetas y autos en Lima</h2><p>En Renting Car A&M atendemos necesidades de movilidad personal, familiar y empresarial desde Santiago de Surco. Explore las categorías del catálogo, compare los modelos disponibles e indique sus fechas y el número de pasajeros. Nuestro equipo le ayudará a confirmar la configuración de la unidad, el lugar de recojo y las condiciones del servicio antes de contratar.</p></section></div></section><Closing/></>;
}
