import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Check, MessageCircle } from 'lucide-react';
import { heavyServices } from '@/lib/services';
import { whatsappLink } from '@/lib/business';
import { pageMetadata } from '@/lib/seo';
import type { ServiceId } from '@/lib/quote';
import { Photo } from '@/components/Catalog';
import QuoteForm from '@/components/QuoteForm';

export const dynamicParams = false;
export function generateStaticParams() { return heavyServices.map(service => ({ slug: service.id })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = heavyServices.find(item => item.id === slug);
  const title = slug === 'excavadora-cat-330dl' ? 'Alquiler de excavadora CAT 330DL' : service?.name || '';
  return service ? pageMetadata(title, `Cotice ${service.name.toLowerCase()} con Renting Car A&M. Comparta la ubicación, fechas y detalles de su proyecto para recibir una propuesta.`, `/maquinaria-y-transporte/${slug}/`) : {};
}
export default async function HeavyDetail({ params }: Props) {
  const { slug } = await params;
  const service = heavyServices.find(item => item.id === slug);
  if (!service) notFound();
  return <><section className="section container detail-section"><Link className="back-link" href="/maquinaria-y-transporte/"><ArrowLeft size={17}/>Maquinaria y transporte</Link><div className="detail-grid"><div className="detail-gallery">{service.images.map((photo, index) => <Photo key={photo.src} photo={photo} priority={index === 0}/>)}</div><div className="detail-copy"><p className="eyebrow">{service.equipment}</p><h1>{service.name}{service.id === 'excavadora-cat-330dl' ? ' CAT 330DL' : ''}</h1><p className="lead">{service.description}</p><div className="application-tags">{service.applications.map(item => <span key={item}>{item}</span>)}</div><div className="button-row"><a className="button accent" href="#cotizacion">Solicitar cotización <ArrowUpRight size={18}/></a><a className="button secondary" href={whatsappLink(service.message)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>WhatsApp</a></div></div></div></section><section className="section soft"><div className="container contact-layout"><Suspense fallback={<p>Cargando formulario…</p>}><QuoteForm initialService={service.id as ServiceId}/></Suspense><aside className="service-guidance"><p className="eyebrow">Preparemos su propuesta</p><h2>Los detalles hacen<br/>la diferencia.</h2><p>Para evaluar su servicio, comparta esta información:</p><ul>{service.quoteFields.map(item => <li key={item}><Check size={19}/>{item}</li>)}</ul><div className="detail-note"><h3>Condiciones del servicio</h3><p>Consulte capacidad del equipo, operador o conductor, combustible, movilización y modalidad de contratación. Las condiciones se acuerdan en su cotización.</p></div>{service.specifications && <dl className="spec-table">{service.specifications.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>}</aside></div></section></>;
}
