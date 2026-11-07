'use client';
import {ContentText,ContentLink} from '@/components/ContentText';
import {useMarketing} from '@/components/MarketingProvider';
import { Clock, Mail, MapPin, MessageCircle, Phone, ArrowUpRight } from 'lucide-react';


export default function Contact() {
  const {business,whatsappLabel,whatsappLink,block}=useMarketing();const intro=block('contact-intro');
  return <aside className="contact-details" aria-label="Datos de contacto">
    <div className="contact-card"><p className="eyebrow">Conversemos directamente</p><h2>{intro.title}</h2><ContentText text={intro.body}/><ContentLink block={intro}/>
      <a className="contact-row" href={whatsappLink('Hola, Renting Car A&M. Deseo una cotización.')} target="_blank" rel="noopener noreferrer"><MessageCircle/><span><small>WhatsApp de consultas</small><strong>{whatsappLabel}</strong></span><ArrowUpRight size={18}/></a>
      <a className="contact-row" href={`tel:${business.phone}`}><Phone/><span><small>Central telefónica</small><strong>{business.phoneLabel}</strong></span></a>
      <a className="contact-row" href={`mailto:${business.email}`}><Mail/><span><small>Alquileres y consultas</small><strong>{business.email}</strong></span></a>
      <a className="contact-row" href={`mailto:${business.adminEmail}`}><Mail/><span><small>Administración</small><strong>{business.adminEmail}</strong></span></a>
      <div className="contact-row"><MapPin/><span><small>Visítenos</small><address>{business.address}</address></span></div>
      <div className="contact-row"><Clock/><span><small>Horario de atención</small><strong>{business.hours}</strong><small>Coordine el día de su visita por WhatsApp.</small></span></div>
    </div>
    <div className="map-panel"><iframe src={business.mapEmbed} title="Ubicación de Renting Car A&M en Av. Santiago de Surco 3573" width="600" height="360" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/><div className="map-links"><a href={business.mapsUrl} target="_blank" rel="noopener noreferrer">Google Maps <ArrowUpRight size={16}/></a><a href={business.wazeUrl} target="_blank" rel="noopener noreferrer">Waze <ArrowUpRight size={16}/></a></div></div>
  </aside>;
}
