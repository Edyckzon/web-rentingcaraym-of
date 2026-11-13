'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ChevronDown, Menu, MessageCircle, Phone, X } from 'lucide-react';
import { useMarketing } from '@/components/MarketingProvider';
import brandLogo from '@/lib/img/RENTING-CAR.png';

type NavLink = { label: string; href: string };
type NavGroup = { id: string; label: string; links: NavLink[] };

const navigation: (NavLink | NavGroup)[] = [
  { label: 'Inicio', href: '/' },
  { id: 'flota', label: 'Flota', links: [
    { label: 'Ver toda la flota', href: '/flota/' },
    { label: 'Camionetas SUV', href: '/flota/suv/' },
    { label: 'Pickups 4x4', href: '/flota/pickup-4x4/' },
    { label: 'Familiares de 7 asientos', href: '/flota/7-asientos/' },
    { label: 'Sedanes', href: '/flota/sedan/' },
    { label: 'Autos a GLP', href: '/alquiler-de-autos-glp/' },
  ] },
  { label: 'Tarifario', href: '/tarifario/' },
  { label: 'Promociones', href: '/promociones/' },
  { id: 'servicios', label: 'Servicios', links: [
    { label: 'Alquiler para empresas', href: '/alquiler-para-empresas/' },
    { label: 'Maquinaria y transporte', href: '/maquinaria-y-transporte/' },
    { label: 'Excavadora CAT 330DL', href: '/maquinaria-y-transporte/excavadora-cat-330dl/' },
    { label: 'Alquiler de volquetes', href: '/maquinaria-y-transporte/volquetes/' },
    { label: 'Transporte de carga', href: '/maquinaria-y-transporte/transporte-de-carga/' },
  ] },
  { id: 'ayuda', label: 'Ayuda', links: [
    { label: 'Cómo funciona', href: '/como-funciona/' },
    { label: 'Requisitos de alquiler', href: '/requisitos/' },
    { label: 'Nosotros', href: '/nosotros/' },
    { label: 'Contacto', href: '/contacto/' },
    { label: 'Libro de Reclamaciones', href: '/libro-de-reclamaciones/' },
    { label: 'Privacidad', href: '/politica-de-privacidad/' },
    { label: 'Términos y condiciones', href: '/terminos-y-condiciones/' },
  ] },
];

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';

export default function Header({ showGuides = false }: { showGuides?: boolean }) {
  const { business, whatsappLabel, whatsappLink } = useMarketing();
  const pathname = normalizePath(usePathname());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [group, setGroup] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const current = (href: string) => pathname === normalizePath(href);
  const inSection = (href: string) => current(href) || (href !== '/' && pathname.startsWith(`${normalizePath(href)}/`));

  function close() {
    setGroup(null);
    setMobileOpen(false);
  }

  useEffect(() => { close(); }, [pathname]);
  useEffect(() => {
    if (!mobileOpen && !group) return;
    function onPointer(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) close();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (group) {
        setGroup(null);
        root.current?.querySelector<HTMLButtonElement>(`[aria-controls="nav-${group}"]`)?.focus();
      } else {
        close();
        toggle.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [group, mobileOpen]);

  return <div ref={root} className="site-header" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) close();
  }}>
    <div className="topbar"><div className="container topbar-inner">
      <a href={business.groupUrl}><ArrowLeft size={14} aria-hidden="true"/> Grupo A&M</a>
      <div className="topbar-contact">
        <a className="topbar-phone" href={`tel:${business.phone}`}><Phone size={13} aria-hidden="true"/>{business.phoneLabel}</a>
        <a href={whatsappLink('Hola, Renting Car A&M. Deseo información sobre sus servicios.')} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${whatsappLabel}`}>
          <MessageCircle size={15} aria-hidden="true"/><span>{whatsappLabel}</span>
        </a>
      </div>
    </div></div>
    <header className="header container site-header-inner">
      <Link href="/" className="brand" aria-label="Renting Car A&M, inicio" onClick={close}>
        <img src={brandLogo.src} width={brandLogo.width} height={brandLogo.height} alt="Renting Car A&M"/>
      </Link>
      <Link className="site-nav-link site-mobile-rates" href="/tarifario/" aria-current={current('/tarifario/') ? 'page' : undefined} onClick={close}>Tarifario</Link>
      <button ref={toggle} className="site-menu-toggle" type="button" aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-controls="main-navigation" aria-expanded={mobileOpen} onClick={() => { setMobileOpen(!mobileOpen); setGroup(null); }}>
        {mobileOpen ? <X aria-hidden="true"/> : <Menu aria-hidden="true"/>}
      </button>
      <nav id="main-navigation" className="site-nav" data-open={mobileOpen} aria-label="Navegación principal">
        <ul className="site-nav-list">
          {navigation.map(item => {
            if ('href' in item) return <li key={item.href} className={item.href === '/tarifario/' ? 'site-desktop-rates' : undefined}>
              <Link className="site-nav-link" href={item.href} aria-current={current(item.href) ? 'page' : undefined} onClick={close}>{item.label}</Link>
            </li>;
            const expanded = group === item.id;
            const links = item.id === 'ayuda' && showGuides
              ? [...item.links, { label: 'Guías de alquiler', href: '/guias/' }]
              : item.links;
            return <li className="site-nav-group" key={item.id} onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget)) setGroup(open => open === item.id ? null : open);
            }}>
              <button className="site-nav-link" type="button" aria-controls={`nav-${item.id}`} aria-expanded={expanded}
                data-current={links.some(link => inSection(link.href))} onClick={() => setGroup(expanded ? null : item.id)}>
                {item.label}<ChevronDown size={15} aria-hidden="true"/>
              </button>
              <ul id={`nav-${item.id}`} className="site-nav-popover" hidden={!expanded}>
                {links.map(link => <li key={link.href}><Link href={link.href} aria-current={current(link.href) ? 'page' : undefined} onClick={close}>
                  {link.label}<ArrowUpRight size={14} aria-hidden="true"/>
                </Link></li>)}
              </ul>
            </li>;
          })}
        </ul>
        <Link className="button accent site-mobile-quote" href="/contacto/#cotizacion" onClick={close}>Solicitar cotización <ArrowUpRight size={17} aria-hidden="true"/></Link>
      </nav>
      <Link className="button accent site-desktop-quote" href="/contacto/#cotizacion" onClick={close}>Cotizar <ArrowUpRight size={17} aria-hidden="true"/></Link>
    </header>
  </div>;
}
