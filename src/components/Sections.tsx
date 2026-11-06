'use client';
import {useMarketing} from '@/components/MarketingProvider';
import Link from 'next/link';
import { ArrowUpRight, Building2, CarFront, ChevronDown, MapPin, MessageCircle, Wrench } from 'lucide-react';


export function PageIntro({ label, title, description }: { label: string; title: string; description: string }) {
  return <section className="page-intro"><div className="container"><p className="eyebrow">{label}</p><h1>{title}</h1><p className="lead">{description}</p></div></section>;
}

export function WhyUs() {
  return <section className="section container" id="nosotros"><div className="section-heading"><div><p className="eyebrow">Por qué A&M</p><h2>Un equipo cerca<br/>de lo que necesita.</h2></div><Link className="text-link" href="/nosotros/">Conozca Renting Car A&M <ArrowUpRight size={18}/></Link></div>
    <div className="benefits-grid">{[
      { icon: CarFront, title: 'Dos líneas de servicio', text: 'Vehículos livianos, maquinaria y transporte de carga en un mismo lugar.' },
      { icon: Wrench, title: 'Taller propio en Surco', text: 'Contamos con un taller de reparación en nuestra sede de Santiago de Surco.' },
      { icon: Building2, title: 'Personas y empresas', text: 'Cuéntenos su necesidad de movilidad o el trabajo que requiere su proyecto.' },
      { icon: MapPin, title: 'Atención directa', text: 'Visítenos en Surco o converse con nuestro equipo por WhatsApp.' },
    ].map(({ icon: Icon, title, text }) => <article key={title}><Icon size={28} strokeWidth={1.5}/><h3>{title}</h3><p>{text}</p></article>)}</div>
  </section>;
}

export function Steps() {
  return <section className="section soft" id="como-funciona"><div className="container"><div className="section-heading"><div><p className="eyebrow">Cómo trabajamos</p><h2>De su consulta<br/>a la entrega.</h2></div><p>Coordinamos los detalles de su servicio<br/>con atención personalizada.</p></div><ol className="steps-grid">{[
    ['Elija su vehículo o servicio', 'Explore nuestra flota liviana y las opciones de maquinaria y transporte.'],
    ['Solicite su cotización', 'Indique fechas, ubicación y necesidades para recibir una propuesta.'],
    ['Coordine documentos y contrato', 'Revise con nuestro equipo los requisitos, las condiciones y la disponibilidad.'],
    ['Reciba su unidad', 'Una vez acordado el servicio, coordine la entrega o el inicio del trabajo.'],
  ].map(([title, text], index) => <li key={title}><span className="step-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></div></section>;
}

export function Faq() {
  return <section className="section dark-section" id="preguntas-frecuentes"><div className="container faq-layout"><div><p className="eyebrow">Preguntas frecuentes</p><h2>Antes de<br/>su cotización.</h2><p>Estamos para ayudarle a elegir el servicio adecuado.</p></div><div className="faq">{[
    ['¿Cómo solicito una cotización?', 'Elija un modelo o servicio y pulse Cotizar. También puede completar el formulario de contacto para preparar un mensaje y enviarlo por WhatsApp.'],
    ['¿Qué necesito para alquilar?', 'Solicite a nuestro equipo los documentos, requisitos de licencia y garantía aplicables a la unidad y al tipo de servicio que necesita.'],
    ['¿Qué incluye la tarifa y el seguro?', 'La tarifa, el kilometraje, las coberturas y las formas de pago se detallan en la propuesta. Consúltelos antes de confirmar el alquiler.'],
    ['¿Puedo solicitar conductor u operador?', 'Indique si necesita conductor u operador al solicitar la cotización. Nuestro equipo confirmará las opciones para su servicio.'],
    ['¿Atienden proyectos fuera de Lima?', 'Indique el lugar de obra o el origen y destino de la carga. La cobertura y movilización se evalúan para cada solicitud.'],
    ['¿Enviar una consulta confirma mi reserva?', 'La solicitud inicia una conversación. La disponibilidad, las condiciones y la contratación se coordinan directamente con nuestro equipo.'],
  ].map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={19}/></summary><p>{answer}</p></details>)}</div></div></section>;
}

export function Closing() {
  const {whatsappLink}=useMarketing();
  return <section className="closing"><div className="container closing-inner"><div><p className="eyebrow">Hablemos de su próximo proyecto</p><h2>¿Necesita un vehículo o equipo?</h2><p>Solicite una cotización con los detalles de su servicio.</p></div><div className="button-row"><Link className="button accent" href="/contacto/#cotizacion">Solicitar cotización <ArrowUpRight size={18}/></Link><a className="button secondary" href={whatsappLink('Hola, Renting Car A&M. Deseo una cotización.')} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>WhatsApp</a></div></div></section>;
}
