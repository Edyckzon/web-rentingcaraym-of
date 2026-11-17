'use client';
import {useCommercial,useMarketing} from '@/components/MarketingProvider';

import Link from 'next/link';
import { ArrowUpRight, Building2, Wrench, Truck } from 'lucide-react';

import { formatMoney, startingRentalRates, minimumRatesByCurrency } from '@/lib/rental-pricing.mjs';
import {ContentText,ContentLink} from './ContentText';
import ServicePrice from './ServicePrice';
import { VehicleCard } from '@/components/Catalog';
import RentalSearch from '@/components/RentalSearch';
import RentalInformation from '@/components/RentalInformation';
import { Closing, Faq, Steps, WhyUs } from '@/components/Sections';
import OfficeJourney from '@/components/OfficeJourney';
import { resolveHomeCover } from '@/lib/home-cover';
import './home-cover.css';


export default function HomeContent(){
 const {home,fleet,featuredFleet,pages,block}=useMarketing();
  const commercial = useCommercial();
  const from = minimumRatesByCurrency(fleet.flatMap(vehicle => startingRentalRates(vehicle.rates, commercial?.rules)));
  const cover = resolveHomeCover(home.hero);
  const page=pages.find(p=>p.path==='/');
  return <>
    <section className="home-showcase" aria-labelledby="hero-title">
      {cover && <figure className="home-showcase-visual">
        <picture>
          {cover.mobile && <source media="(max-width: 900px)" srcSet={cover.mobile.src} width={cover.mobile.width} height={cover.mobile.height}/>}
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
          {from.map(rate => <p className="hero-from" key={rate.currency}><strong>Desde {formatMoney(rate.centsPerDay, rate.currency)} / día</strong><span>{rate.term} · IGV incluido</span></p>)}
          <div className="button-row"><Link className="button accent" href={home.firstUrl}>{home.firstLabel} <ArrowUpRight size={19}/></Link><Link className="button outline-light" href={home.secondUrl}>{home.secondLabel} <ArrowUpRight size={19}/></Link></div>
        </div>
        <div className="home-showcase-footer"><span>Atención personalizada desde Surco, Lima</span><OfficeJourney/></div>
      </div>
    </section>
    <div className="container rental-search-wrap"><RentalSearch/></div>
    <section className="section soft" id="flota"><div className="container"><div className="section-heading"><div><p className="eyebrow">Flota destacada</p><h2>{block('home-fleet').title}</h2></div><ContentLink block={block('home-fleet')}/></div><div className="vehicle-grid">{featuredFleet.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle}/>)}</div><p className="section-note">{block('home-fleet').body}</p></div></section>
    <section className="section container">
      <div className="section-heading"><h2>Servicios para su operación</h2></div>
      <div className="vehicle-grid">
        <article className="promotion-card"><Building2 aria-hidden="true"/><h3>{block('home-company').title}</h3><ContentText text={block('home-company').body}/><ServicePrice service="empresas"/><ContentLink block={block('home-company')}/></article>
        <article className="promotion-card"><Wrench aria-hidden="true"/><h3>{block('home-machinery').title}</h3><ContentText text={block('home-machinery').body}/><ServicePrice service="excavadora-cat-330dl"/><ContentLink block={block('home-machinery')}/></article>
        <article className="promotion-card"><Truck aria-hidden="true"/><h3>{block('home-freight').title}</h3><ContentText text={block('home-freight').body}/><ContentLink block={block('home-freight')}/></article>
      </div>
    </section><WhyUs/><Steps/><RentalInformation/><Faq/><Closing/><div className="container section"><Link href="/libro-de-reclamaciones/">Libro de Reclamaciones</Link></div>
  </>;
}
