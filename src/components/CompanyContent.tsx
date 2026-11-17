'use client';
import ManagedIntro from './ManagedIntro';
import FleetFilter from './FleetFilter';
import ServicePrice from './ServicePrice';
import ServiceGallery from './ServiceGallery';
import {Closing} from './Sections';
import {useMarketing} from './MarketingProvider';
import {ContentText,ContentLink} from './ContentText';
export default function CompanyContent(){
 const {block,servicePages}=useMarketing();const service=servicePages.find(item=>item.id==='empresas');
 return <><ManagedIntro path="/alquiler-para-empresas/" label={service?.equipment??'Movilidad empresarial'}/>
 <section className="section container"><ServiceGallery id="empresas" hideEmpty/>{service&&<><ContentText text={service.description}/><ServicePrice service="empresas"/></>}
 <div className="benefits-grid company-benefits">{[1,2,3,4].map(number=>{const item=block('company-0'+number);return <article key={item.id}><h2>{item.title}</h2><ContentText text={item.body}/><ContentLink block={item}/></article>;})}</div></section>
 <section className="section soft"><div className="container"><FleetFilter/></div></section><Closing/></>;
}
