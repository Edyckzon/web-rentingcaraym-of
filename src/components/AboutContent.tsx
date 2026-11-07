'use client';
import ManagedIntro from '@/components/ManagedIntro';
import {useMarketing} from '@/components/MarketingProvider';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Wrench } from 'lucide-react';
import { Closing, PageIntro, WhyUs } from '@/components/Sections';




export default function AboutContent(){
 const {business}=useMarketing();
  return <><ManagedIntro path="/nosotros/" label="Nosotros"/><section className="section container about-grid"><div><p className="eyebrow">Su movilidad. Su proyecto.</p><h2>Empresa de alquiler de vehículos y maquinaria en Santiago de Surco</h2><p>Reunimos dos líneas de servicio: vehículos livianos para movilidad personal y corporativa, y maquinaria y transporte para las necesidades de su proyecto.</p><p>Desde nuestra sede en Santiago de Surco, coordinamos con usted las características del servicio, la disponibilidad y las condiciones de cada cotización.</p><Link className="text-link" href="/maquinaria-y-transporte/">Explore nuestros servicios <ArrowUpRight size={18}/></Link></div><div className="workshop-panel"><Wrench size={38} strokeWidth={1.5}/><p className="eyebrow">Nuestra sede</p><h2>Taller propio<br/>en Surco.</h2><p>Contamos con un taller de reparación en la misma sede. Consulte con nuestro equipo sobre la atención de su vehículo.</p><address><MapPin size={20}/>{business.address}</address><a className="text-link" href={business.mapsUrl} target="_blank" rel="noopener noreferrer">Cómo llegar <ArrowUpRight size={18}/></a></div></section><WhyUs/><Closing/></>;
}
