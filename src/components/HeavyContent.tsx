'use client';
import {Suspense} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,Check,MessageCircle} from 'lucide-react';
import {useMarketing} from './MarketingProvider';
import ServiceGallery from './ServiceGallery';
import ServicePrice from './ServicePrice';
import ServiceWhatsApp from './ServiceWhatsApp';
import ManagedHeading from './ManagedHeading';
import QuoteForm from './QuoteForm';
import {ContentText} from './ContentText';
import type {ServiceId} from '@/lib/quote';
export default function HeavyContent({id}:{id:string}){
 const service=useMarketing().servicePages.find(item=>item.id===id);if(!service)return null;
 return <><section className="section container detail-section"><Link className="back-link" href="/maquinaria-y-transporte/"><ArrowLeft size={17}/>Maquinaria y transporte</Link>
 <div className="detail-grid"><div className="detail-gallery"><ServiceGallery id={id}/></div><div className="detail-copy"><p className="eyebrow">{service.equipment}</p><ManagedHeading path={`/maquinaria-y-transporte/${id}/`} fallback={service.name}/><ContentText text={service.description}/><ServicePrice service={id}/><div className="application-tags">{service.applications.map(item=><span key={item}>{item}</span>)}</div><div className="button-row"><a className="button accent" href="#cotizacion">Solicitar cotización<ArrowUpRight size={18}/></a><ServiceWhatsApp message={service.message}><MessageCircle size={18}/>WhatsApp</ServiceWhatsApp></div></div></div></section>
 <section className="section soft"><div className="container contact-layout"><Suspense fallback={<p>Cargando formulario…</p>}><QuoteForm initialService={id as ServiceId}/></Suspense><aside className="service-guidance"><h2>{service.guidanceTitle??service.name}</h2><ContentText text={service.guidanceIntro??'Comparta los detalles de su solicitud.'}/><ul>{service.quoteFields.map(item=><li key={item}><Check size={19}/>{item}</li>)}</ul><div className="detail-note"><h3>Condiciones de {service.name.toLowerCase()}</h3><ContentText text={service.conditions??'Consulte las condiciones del servicio con nuestro equipo.'}/></div></aside></div></section></>;
}
