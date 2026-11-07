'use client';
import {useMarketing} from '@/components/MarketingProvider';


import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Menu, MessageCircle, Phone, X } from 'lucide-react';
import brandLogo from '@/lib/img/RENTING-CAR.png';


export const navigation = [
  ['Inicio', '/'], ['Flota de vehículos', '/flota/'],
  ['Maquinaria y transporte', '/maquinaria-y-transporte/'],
  ['Empresas', '/alquiler-para-empresas/'], ['Nosotros', '/nosotros/'], ['Contacto', '/contacto/'],
] as const;

export default function Header() {
  const {business,whatsappLabel,whatsappLink}=useMarketing();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function close(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
    }
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);
  return <div className="site-header">
    <div className="topbar"><div className="container topbar-inner">
      <a href={business.groupUrl}><ArrowLeft size={14}/> Grupo A&M</a>
      <div className="topbar-contact"><a className="topbar-phone" href={`tel:${business.phone}`}><Phone size={13}/>{business.phoneLabel}</a><a href={whatsappLink('Hola, Renting Car A&M. Deseo información sobre sus servicios.')} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${whatsappLabel}`}><MessageCircle size={15}/><span>{whatsappLabel}</span></a></div>
    </div></div>
    <header className="header container">
      <Link href="/" className="brand" aria-label="Renting Car A&M, inicio" onClick={() => setOpen(false)}><img src={brandLogo.src} width={brandLogo.width} height={brandLogo.height} alt="Renting Car A&M"/></Link>
      <nav id="main-navigation" className={`nav${open ? ' open' : ''}`} aria-label="Navegación principal">
        {navigation.map(([label, href]) => <Link key={href} href={href} aria-current={(href === '/' ? pathname === '/' : `${pathname}/`.startsWith(href)) ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link className="button accent mobile-quote" href="/contacto/#cotizacion" onClick={() => setOpen(false)}>Solicitar cotización <ArrowUpRight size={17}/></Link>
      </nav>
      <Link className="button accent header-cta" href="/contacto/#cotizacion" onClick={() => setOpen(false)}>Solicitar cotización <ArrowUpRight size={17}/></Link>
      <button ref={toggle} className="menu-toggle" type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-controls="main-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    </header>
  </div>;
}
