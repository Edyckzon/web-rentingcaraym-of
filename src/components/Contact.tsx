import { ArrowUpRight, MapPin, Phone, Mail, MessageCircle, Wrench, Building2 } from 'lucide-react';
import { business, whatsappLink } from '@/lib/business';

export default function Contact() {
  return <>
    <section className="local-services container" aria-label="Servicios y respaldo">
      <div className="service-story reveal">
        <Wrench className="service-icon" size={27}/>
        <p className="eyebrow muted">MÁS CERCA DE TI</p>
        <h3>Tu taller, también en Surco.</h3>
        <p>Contamos con un taller de reparación en nuestra misma sede. Cuéntanos qué necesita tu vehículo y coordina tu atención con el equipo.</p>
        <a className="text-link" href={whatsappLink('Hola, quisiera consultar por el taller de reparación en la sede de Surco.')} target="_blank" rel="noopener noreferrer">Consultar por el taller <ArrowUpRight size={18}/></a>
      </div>
      <div className="service-story reveal">
        <Building2 className="service-icon" size={27}/>
        <p className="eyebrow muted">SOMOS PARTE DE GRUPO AyM</p>
        <h3>Movilidad que no te detiene.</h3>
        <p>Alquiler de vehículos y maquinaria para empresas y personas, con atención personalizada y el respaldo de Grupo AyM.</p>
        <a className="text-link" href={business.groupUrl} target="_blank" rel="noopener noreferrer">Conoce Grupo AyM <ArrowUpRight size={18}/></a>
      </div>
    </section>

    <section className="contact-section" id="contacto" aria-labelledby="contact-title">
      <div className="container">
        <div className="section-heading reveal">
          <div><p className="eyebrow muted">03 / CONVERSEMOS DE TU PRÓXIMO PLAN</p><h2 id="contact-title">Estamos en Surco.<br/><span>Y a un mensaje de ti.</span></h2></div>
          <p>Alquiler, consultas y taller de reparación.<br/>Conversemos y encontremos cómo ayudarte.</p>
        </div>
        <div className="contact-layout">
          <div className="contact-panel">
            <p className="eyebrow">ATENCIÓN PERSONALIZADA</p>
            <a className="contact-whatsapp" href={whatsappLink('Hola, Renting Car A&M. Quisiera información sobre sus servicios.')} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={25}/><span><small>Escríbenos por WhatsApp</small><strong>{business.whatsappLabel}</strong></span><ArrowUpRight size={23}/>
            </a>
            <a className="contact-row" href={`tel:${business.phone}`}><Phone size={19}/><span><small>Llama a nuestra central</small><strong>{business.phoneLabel}</strong></span><ArrowUpRight size={18}/></a>
            <a className="contact-row" href={`mailto:${business.email}`}><Mail size={19}/><span><small>Alquileres y consultas</small><strong>{business.email}</strong></span><ArrowUpRight size={18}/></a>
            <a className="contact-row" href={`mailto:${business.adminEmail}`}><Mail size={19}/><span><small>Administración · Grupo AyM</small><strong>{business.adminEmail}</strong></span><ArrowUpRight size={18}/></a>
            <div className="contact-location"><MapPin size={20}/><div><strong>Visítanos en Lima, Surco</strong><address>{business.address}</address><span>Renting Car A&M · Taller de reparación en la misma sede</span></div></div>
          </div>
          <div className="map-panel">
            <iframe src={business.mapEmbed} title="Ubicación de Renting Car A&M y taller en Av. Santiago de Surco 3573" width="600" height="450" allowFullScreen loading="eager" referrerPolicy="strict-origin-when-cross-origin"/>
            <div className="map-caption"><span><MapPin size={17}/> TU PUNTO DE PARTIDA</span><a className="text-link" href={business.mapsUrl} target="_blank" rel="noopener noreferrer">Cómo llegar <ArrowUpRight size={18}/></a></div>
          </div>
        </div>
        <div className="contact-bottom"><span>Vehículos · Maquinaria · Taller de reparación</span><a href={business.groupUrl} target="_blank" rel="noopener noreferrer">Una empresa de <strong>Grupo <span>AyM</span></strong><ArrowUpRight size={16}/></a></div>
      </div>
    </section>
  </>;
}
