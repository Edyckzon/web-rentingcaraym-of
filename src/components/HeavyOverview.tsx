'use client';
import ManagedIntro from './ManagedIntro';
import ServiceGallery from './ServiceGallery';
import ServicePrice from './ServicePrice';
import {ServiceCards} from './Catalog';
import {Closing,WhyUs} from './Sections';
import {useMarketing} from './MarketingProvider';
import {ContentText} from './ContentText';
export default function HeavyOverview(){
 const service=useMarketing().servicePages.find(item=>item.id==='maquinaria-y-transporte');
 return <><ManagedIntro path="/maquinaria-y-transporte/" label={service?.equipment??'Nuestra línea pesada'}/><section className="section soft"><div className="container"><ServiceGallery id="maquinaria-y-transporte" hideEmpty/>{service&&<ContentText text={service.description}/>}<ServicePrice service="maquinaria-y-transporte"/><ServiceCards/>{service&&<p className="section-note">{service.conditions}</p>}</div></section><WhyUs/><Closing/></>;
}
