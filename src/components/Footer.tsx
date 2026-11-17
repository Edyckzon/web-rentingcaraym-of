'use client';
import {ContentText,ContentLink} from '@/components/ContentText';
import SiteSignature from '@/components/SiteSignature';
import {useMarketing} from '@/components/MarketingProvider';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, MapPin, MessageCircle } from 'lucide-react';
import {defaultNavigation} from '@/lib/navigation';
import brandLogo from '@/lib/img/RENTING-CAR.png';



function FooterNavLink({href,children}:{href:string;children:React.ReactNode}){
 const {navigation}=useMarketing();const original=defaultNavigation.find(item=>item.href===href);
 const item=navigation.find(item=>item.id===original?.id);
 if(!item?.visible||!item.href||(item.parentId&&!navigation.some(parent=>parent.id===item.parentId&&parent.visible)))return null;
 return <Link href={item.href}>{item.label}</Link>;
}

export default function Footer() {
  const {business,whatsappLabel,whatsappLink,block}=useMarketing();const summary=block('footer-summary');
  return <>
    <footer className="footer"><div className="container">
      <div className="footer-grid">
        <div className="footer-about"><Link className="footer-logo" href="/" aria-label="Renting Car A&M, inicio"><img src={brandLogo.src} width={brandLogo.width} height={brandLogo.height} alt="Renting Car A&M"/></Link><ContentText text={summary.body}/><ContentLink block={summary}/></div>
        <div><h2>Explore</h2><FooterNavLink href="/">Inicio</FooterNavLink><FooterNavLink href="/flota/">Flota de vehículos</FooterNavLink><FooterNavLink href="/tarifario/">Tarifario</FooterNavLink><FooterNavLink href="/promociones/">Promociones</FooterNavLink><FooterNavLink href="/requisitos/">Requisitos</FooterNavLink><FooterNavLink href="/alquiler-de-autos-glp/">Autos a GLP</FooterNavLink><FooterNavLink href="/alquiler-para-empresas/">Empresas</FooterNavLink><FooterNavLink href="/nosotros/">Nosotros</FooterNavLink><FooterNavLink href="/contacto/">Contacto</FooterNavLink></div>
        <div><h2>Servicios</h2><FooterNavLink href="/maquinaria-y-transporte/excavadora-cat-330dl/">Excavadora CAT 330DL</FooterNavLink><FooterNavLink href="/maquinaria-y-transporte/volquetes/">Alquiler de volquetes</FooterNavLink><FooterNavLink href="/maquinaria-y-transporte/transporte-de-carga/">Transporte de carga</FooterNavLink><FooterNavLink href="/como-funciona/">Cómo trabajamos</FooterNavLink></div>
        <div><h2>Conversemos</h2><a href={`tel:${business.phone}`}>{business.phoneLabel}</a><a href={whatsappLink('Hola, Renting Car A&M. Deseo una cotización.')} target="_blank" rel="noopener noreferrer">WhatsApp {whatsappLabel}<ArrowUpRight size={14}/></a><a href={`mailto:${business.email}`}>{business.email}</a><a href={business.mapsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={16}/>{business.address}</a><p>Horario: {business.hours}</p></div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} <a href={business.groupUrl}>Grupo A&amp;M</a>. Todos los derechos reservados.</p>
        <div><FooterNavLink href="/politica-de-privacidad/">Privacidad</FooterNavLink><FooterNavLink href="/terminos-y-condiciones/">Términos</FooterNavLink><FooterNavLink href="/libro-de-reclamaciones/"><BookOpen size={14}/>Libro de Reclamaciones</FooterNavLink></div>
      </div>
      <SiteSignature/>
    </div></footer>
    <a className="floating-whatsapp" href={whatsappLink('Hola, Renting Car A&M. Deseo información sobre sus servicios.')} target="_blank" rel="noopener noreferrer" aria-label="Consultar por WhatsApp"><MessageCircle size={26}/><span>¿Le ayudamos?</span></a>
  </>;
}
