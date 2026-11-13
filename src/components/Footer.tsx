'use client';
import {ContentText,ContentLink} from '@/components/ContentText';
import SiteSignature from '@/components/SiteSignature';
import {useMarketing} from '@/components/MarketingProvider';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, MapPin, MessageCircle } from 'lucide-react';
import brandLogo from '@/lib/img/RENTING-CAR.png';


export default function Footer() {
  const {business,whatsappLabel,whatsappLink,block}=useMarketing();const summary=block('footer-summary');
  return <>
    <footer className="footer"><div className="container">
      <div className="footer-grid">
        <div className="footer-about"><Link className="footer-logo" href="/" aria-label="Renting Car A&M, inicio"><img src={brandLogo.src} width={brandLogo.width} height={brandLogo.height} alt="Renting Car A&M"/></Link><ContentText text={summary.body}/><ContentLink block={summary}/></div>
        <div><h2>Explore</h2><Link href="/">Inicio</Link><Link href="/flota/">Flota de vehículos</Link><Link href="/tarifario/">Tarifario</Link><Link href="/promociones/">Promociones</Link><Link href="/requisitos/">Requisitos</Link><Link href="/alquiler-de-autos-glp/">Autos a GLP</Link><Link href="/alquiler-para-empresas/">Empresas</Link><Link href="/nosotros/">Nosotros</Link><Link href="/contacto/">Contacto</Link></div>
        <div><h2>Servicios</h2><Link href="/maquinaria-y-transporte/excavadora-cat-330dl/">Excavadora CAT 330DL</Link><Link href="/maquinaria-y-transporte/volquetes/">Alquiler de volquetes</Link><Link href="/maquinaria-y-transporte/transporte-de-carga/">Transporte de carga</Link><Link href="/como-funciona/">Cómo trabajamos</Link></div>
        <div><h2>Conversemos</h2><a href={`tel:${business.phone}`}>{business.phoneLabel}</a><a href={whatsappLink('Hola, Renting Car A&M. Deseo una cotización.')} target="_blank" rel="noopener noreferrer">WhatsApp {whatsappLabel}<ArrowUpRight size={14}/></a><a href={`mailto:${business.email}`}>{business.email}</a><a href={business.mapsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={16}/>{business.address}</a><p>Horario: {business.hours}</p></div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} <a href={business.groupUrl}>Grupo A&amp;M</a>. Todos los derechos reservados.</p>
        <div><Link href="/politica-de-privacidad/">Privacidad</Link><Link href="/terminos-y-condiciones/">Términos</Link><Link href="/libro-de-reclamaciones/"><BookOpen size={14}/>Libro de Reclamaciones</Link></div>
      </div>
      <SiteSignature/>
    </div></footer>
    <a className="floating-whatsapp" href={whatsappLink('Hola, Renting Car A&M. Deseo información sobre sus servicios.')} target="_blank" rel="noopener noreferrer" aria-label="Consultar por WhatsApp"><MessageCircle size={26}/><span>¿Le ayudamos?</span></a>
  </>;
}
