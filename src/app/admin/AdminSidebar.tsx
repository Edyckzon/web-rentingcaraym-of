'use client';

import { useEffect, useRef, useState } from 'react';
import { Calculator, CarFront, ChevronDown, ClipboardList, ExternalLink, FileText, Layers3, LayoutTemplate, Link2, LogOut, Phone, Tags, Truck } from 'lucide-react';
import brandLogo from '@/lib/img/RENTING-CAR.png';

export const adminSections = [
  { title: 'Vehículos', icon: CarFront, description: 'Gestiona las fichas, fotografías y destacados de la flota.' },
  { title: 'Portada', icon: LayoutTemplate, description: 'Actualiza la imagen y el mensaje principal del inicio.' },
  { title: 'Botones y enlaces', icon: Link2, description: 'Elige el texto y el destino de los botones de portada.' },
  { title: 'Contacto', icon: Phone, description: 'Actualiza los números y las indicaciones para llegar.' },
  { title: 'Categorías', icon: Layers3, description: 'Gestiona las categorías que aparecen en la flota.' },
  { title: 'Páginas y SEO', icon: FileText, description: 'Edita los títulos y textos publicados en cada página.' },
  { title: 'Textos y enlaces', icon: Link2, description: 'Gestiona requisitos, preguntas, condiciones, privacidad y reclamaciones.' },
  { title: 'Tarifas', icon: Calculator, description: 'Actualiza los precios de alquiler y la garantía de cada vehículo.' },
  { title: 'Ficha técnica', icon: ClipboardList, description: 'Edita datos confirmados, categorías adicionales y visibilidad.' },
  { title: 'Promociones y extras', icon: Tags, description: 'Gestiona campañas, extras, tramos e historial.' },
  { title: 'Solicitudes', icon: ClipboardList, description: 'Consulta las solicitudes recibidas y el estado del aviso por correo.' },
  { title: 'Carga en borrador', icon: Truck, description: 'Prepara rutas y cotizador para revisión interna.' },
] as const;

const groups = [
  { title: 'Flota', sections: [0, 8, 4] },
  { title: 'Gestión comercial', sections: [7, 9, 10, 11] },
  { title: 'Sitio web', sections: [1, 2, 3, 5, 6] },
] as const;

export default function AdminSidebar({ section, busy, onNavigate, onSignOut }: {
  section: number;
  busy: boolean;
  onNavigate: (section: number) => void;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [section]);

  return <aside className="admin-sidebar" onKeyDown={event => {
    if (open && event.key === 'Escape') {
      setOpen(false);
      toggle.current?.focus();
    }
  }}>
    <div className="admin-sidebar-header">
      <div className="admin-sidebar-brand">
        <img src={brandLogo.src} width={brandLogo.width} height={brandLogo.height} alt="Renting Car A&M"/>
        <strong>Administración del sitio</strong>
      </div>
      <button ref={toggle} type="button" className="admin-sidebar-toggle" aria-controls="admin-sidebar-content" aria-expanded={open}
        onClick={() => setOpen(current => !current)}>
        <span>Secciones</span><ChevronDown size={16} aria-hidden="true"/>
      </button>
    </div>
    <div className="admin-sidebar-content" id="admin-sidebar-content" data-expanded={open}>
      <nav className="admin-sidebar-nav" aria-label="Secciones de administración del sitio">
        {groups.map(group => <div key={group.title} className="admin-sidebar-group" role="group" aria-label={group.title}>
          <p>{group.title}</p>
          <ul>{group.sections.map(id => {
            const { title, icon: Icon } = adminSections[id];
            return <li key={id}><button type="button" disabled={busy} aria-current={section === id ? 'page' : undefined}
              onClick={() => section === id ? setOpen(false) : onNavigate(id)}>
              <Icon size={17} aria-hidden="true"/><span>{title}</span>
            </button></li>;
          })}</ul>
        </div>)}
      </nav>
      <div className="admin-sidebar-actions">
        <a href="/" target="_blank" rel="noreferrer"><ExternalLink size={16} aria-hidden="true"/>Ver sitio</a>
        <button type="button" disabled={busy} onClick={onSignOut}><LogOut size={16} aria-hidden="true"/>Cerrar sesión</button>
      </div>
    </div>
  </aside>;
}
