'use client';
import {useMarketing} from '@/components/MarketingProvider';

import Link from 'next/link';
import { ArrowUpRight, CarFront, Truck } from 'lucide-react';

import { referenceImages } from '@/lib/media';

import { Photo, VehicleCard } from '@/components/Catalog';
import RentalInformation from '@/components/RentalInformation';
import { Closing, Faq, Steps, WhyUs } from '@/components/Sections';


export default function HomeContent(){
 const {home,featuredFleet,pages}=useMarketing();
  const page=pages.find(p=>p.path==='/');
  return <>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-media"><img src={home.hero} alt={home.hero === referenceImages.suv.src ? referenceImages.suv.alt : ''} width={1600} height={1067} fetchPriority="high"/><div className="hero-shade"/></div>
      <div className="container hero-content"><p className="eyebrow">Renting Car A&M · Personas y empresas</p><h1 id="hero-title"><b style={{whiteSpace:'pre-line',fontWeight:'inherit'}}>{page?.heading??home.title}</b>{!page&&<><br/><span>{home.accent}</span></>}</h1><p className="hero-description" style={{whiteSpace:'pre-line'}}>{page?.intro??home.slogan}</p><div className="button-row"><Link className="button accent" href={home.firstUrl}>{home.firstLabel} <ArrowUpRight size={19}/></Link><Link className="button outline-light" href={home.secondUrl}>{home.secondLabel} <ArrowUpRight size={19}/></Link></div><div className="hero-bottom"><span>Atención personalizada desde Surco, Lima</span>{home.hero === referenceImages.suv.src && <span>Fotografía referencial</span>}</div></div>
    </section>
    <section className="section container"><div className="section-heading"><div><p className="eyebrow">Nuestras dos líneas</p><h2>Alquiler de autos, camionetas y maquinaria pesada</h2></div><p>Desde su movilidad personal<br/>hasta el trabajo de su empresa.</p></div><div className="business-lines">
      <article className="line-card"><Photo photo={referenceImages.suv}/><div className="line-copy"><CarFront size={28} strokeWidth={1.5}/><h3>Vehículos livianos</h3><p>Camionetas SUV, sedanes y autos familiares para uso personal, ejecutivo y corporativo.</p><Link className="text-link" href="/flota/">Ver flota <ArrowUpRight size={19}/></Link></div></article>
      <article className="line-card"><Photo photo={referenceImages.excavator}/><div className="line-copy"><Truck size={28} strokeWidth={1.5}/><h3>Maquinaria y transporte pesado</h3><p>Excavadora CAT 330DL, volquetes y transporte de carga con camiones Volvo y Scania.</p><Link className="text-link" href="/maquinaria-y-transporte/">Ver servicios <ArrowUpRight size={19}/></Link></div></article>
    </div></section>
    <section className="section soft" id="flota"><div className="container"><div className="section-heading"><div><p className="eyebrow">Flota destacada</p><h2>Autos y camionetas en alquiler en Lima</h2></div><Link className="text-link" href="/flota/">Ver toda la flota <ArrowUpRight size={18}/></Link></div><div className="vehicle-grid">{featuredFleet.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle}/>)}</div><p className="section-note">Consulte la disponibilidad, versión y características de cada unidad. Las fotografías son referenciales.</p></div></section>
    <section className="section container"><div className="section-heading"><div><p className="eyebrow">Movilidad empresarial</p><h2>Autos y camionetas para su equipo</h2></div><Link className="button secondary" href="/alquiler-para-empresas/">Alquiler para empresas <ArrowUpRight size={18}/></Link></div><p>Cuéntenos las fechas, la cantidad de unidades y el uso previsto para preparar una propuesta.</p></section><WhyUs/><Steps/><RentalInformation/><Faq/><Closing/><div className="container section"><Link href="/libro-de-reclamaciones/">Libro de Reclamaciones</Link></div>
  </>;
}
