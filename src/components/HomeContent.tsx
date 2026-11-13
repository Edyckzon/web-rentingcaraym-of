'use client';
import {useCommercial,useMarketing} from '@/components/MarketingProvider';

import Link from 'next/link';
import { ArrowUpRight, Building2, Wrench, Truck } from 'lucide-react';

import { formatSoles, startingRentalRate } from '@/lib/rental-pricing.mjs';
import ServicePrice from './ServicePrice';
import { VehicleCard } from '@/components/Catalog';
import RentalSearch from '@/components/RentalSearch';
import RentalInformation from '@/components/RentalInformation';
import { Closing, Faq, Steps, WhyUs } from '@/components/Sections';
import OfficeJourney from '@/components/OfficeJourney';
import { resolveHomeCover } from '@/lib/home-cover';
import './home-cover.css';


export default function HomeContent(){
 const {home,fleet,featuredFleet,pages}=useMarketing();
  const commercial = useCommercial();
  const from = fleet.flatMap(vehicle => {
    const price = startingRentalRate(vehicle.rates, commercial?.rules);
    return price ? [price] : [];
  }).sort((a,b) => a.centsPerDay-b.centsPerDay)[0];
  const cover = resolveHomeCover(home.hero);
  const page=pages.find(p=>p.path==='/');
  return <>
    <section className="home-showcase" aria-labelledby="hero-title">
      {cover && <figure className="home-showcase-visual">
        <picture>
          {cover.mobile && <source media="(max-width: 600px)" srcSet={cover.mobile.src} width={cover.mobile.width} height={cover.mobile.height}/>}
          <img src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} fetchPriority="high"/>
        </picture>
      </figure>}
      <div className="container home-showcase-details">
        <div className="home-showcase-copy">
          <p className="eyebrow">Renting Car A&M · Personas y empresas</p>
          <h1 id="hero-title"><b style={{whiteSpace:'pre-line',fontWeight:'inherit'}}>{page?.heading??home.title}</b>{!page&&<><br/><span>{home.accent}</span></>}</h1>
          <p className="home-showcase-intro" style={{whiteSpace:'pre-line'}}>{page?.intro??home.slogan}</p>
        </div>
        <div className="home-showcase-actions">
          {from && <p className="hero-from"><strong>Desde {formatSoles(from.centsPerDay)} / día</strong><span>{from.term} · IGV incluido</span></p>}
          <div className="button-row"><Link className="button accent" href={home.firstUrl}>{home.firstLabel} <ArrowUpRight size={19}/></Link><Link className="button outline-light" href={home.secondUrl}>{home.secondLabel} <ArrowUpRight size={19}/></Link></div>
        </div>
        <div className="home-showcase-footer"><span>Atención personalizada desde Surco, Lima</span><OfficeJourney/></div>
      </div>
    </section>
    <div className="container rental-search-wrap"><RentalSearch/></div>
    <section className="section soft" id="flota"><div className="container"><div className="section-heading"><div><p className="eyebrow">Flota destacada</p><h2>Autos y camionetas en alquiler en Lima</h2></div><Link className="text-link" href="/flota/">Ver toda la flota <ArrowUpRight size={18}/></Link></div><div className="vehicle-grid">{featuredFleet.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle}/>)}</div><p className="section-note">Consulte la disponibilidad, versión y características de cada unidad.</p></div></section>
    <section className="section container">
      <div className="section-heading"><h2>Servicios para su operación</h2></div>
      <div className="vehicle-grid">
        <article className="promotion-card"><Building2 aria-hidden="true"/><h3>Alquiler para empresas</h3><p>Coordine la cantidad de unidades y el plazo de alquiler para su equipo.</p><ServicePrice service="empresas"/><Link className="text-link" href="/alquiler-para-empresas/">Ver opciones <ArrowUpRight size={17}/></Link></article>
        <article className="promotion-card"><Wrench aria-hidden="true"/><h3>Maquinaria pesada</h3><p>Consulte excavadora y volquetes para su obra, ubicación y fechas.</p><ServicePrice service="excavadora-cat-330dl"/><Link className="text-link" href="/maquinaria-y-transporte/">Ver servicios <ArrowUpRight size={17}/></Link></article>
        <article className="promotion-card"><Truck aria-hidden="true"/><h3>Transporte de carga</h3><p>Indique origen, destino y características de la carga para evaluar el servicio.</p><Link className="text-link" href="/maquinaria-y-transporte/transporte-de-carga/">Consultar transporte <ArrowUpRight size={17}/></Link></article>
      </div>
    </section><WhyUs/><Steps/><RentalInformation/><Faq/><Closing/><div className="container section"><Link href="/libro-de-reclamaciones/">Libro de Reclamaciones</Link></div>
  </>;
}
