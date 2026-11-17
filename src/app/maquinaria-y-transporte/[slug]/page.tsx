import HeavyContent from '@/components/HeavyContent';
import JsonLd from '@/components/JsonLd';
import BreadcrumbData from '@/components/BreadcrumbData';
import ServicePrice from '@/components/ServicePrice';
import { business } from '@/lib/business';
import ManagedHeading from '@/components/ManagedHeading';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Check, MessageCircle } from 'lucide-react';
import { heavyServices } from '@/lib/services';
import ServiceWhatsApp from '@/components/ServiceWhatsApp';
import { pageMetadata } from '@/lib/seo';
import type { ServiceId } from '@/lib/quote';
import ServiceGallery from '@/components/ServiceGallery';
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
export default async function HeavyDetail({params}:Props){
 const {slug}=await params;const service=heavyServices.find(item=>item.id===slug);if(!service)notFound();
 return <><BreadcrumbData trail={[{name:'Maquinaria y transporte',path:'/maquinaria-y-transporte/'},{name:service.name,path:`/maquinaria-y-transporte/${slug}/`}]}/><JsonLd data={{'@context':'https://schema.org','@type':'Service',name:service.name,description:service.description,provider:{'@type':'Organization',name:'Renting Car A&M'},url:`${business.siteUrl}/maquinaria-y-transporte/${slug}/`}}/><HeavyContent id={slug}/></>;
}
