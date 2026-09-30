import Link from 'next/link';
import { ArrowUpRight, MapPin, Wrench } from 'lucide-react';
import { Closing, PageIntro, WhyUs } from '@/components/Sections';
import { business } from '@/lib/business';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('Nosotros', 'Conozca Renting Car A&M: vehículos, maquinaria, transporte de carga y taller de reparación en Santiago de Surco, Lima.', '/nosotros/');

export default function AboutPage() {
  return <><PageIntro label="Nosotros" title="Renting Car A&M" description="Alquiler de vehículos, maquinaria y transporte de carga para personas y empresas."/><section className="section container about-grid"><div><p className="eyebrow">Su movilidad. Su proyecto.</p><h2>Un servicio que empieza<br/>por escucharle.</h2><p>Reunimos dos líneas de servicio: vehículos livianos para movilidad personal y corporativa, y maquinaria y transporte para las necesidades de su proyecto.</p><p>Desde nuestra sede en Santiago de Surco, coordinamos con usted las características del servicio, la disponibilidad y las condiciones de cada cotización.</p><Link className="text-link" href="/maquinaria-y-transporte/">Explore nuestros servicios <ArrowUpRight size={18}/></Link></div><div className="workshop-panel"><Wrench size={38} strokeWidth={1.5}/><p className="eyebrow">Nuestra sede</p><h2>Taller propio<br/>en Surco.</h2><p>Contamos con un taller de reparación en la misma sede. Consulte con nuestro equipo sobre la atención de su vehículo.</p><address><MapPin size={20}/>{business.address}</address><a className="text-link" href={business.mapsUrl} target="_blank" rel="noopener noreferrer">Cómo llegar <ArrowUpRight size={18}/></a></div></section><WhyUs/><Closing/></>;
}
