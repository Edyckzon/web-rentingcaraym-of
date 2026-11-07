import ManagedIntro from '@/components/ManagedIntro';
import { Suspense } from 'react';
import Contact from '@/components/Contact';
import QuoteForm from '@/components/QuoteForm';
import { PageIntro } from '@/components/Sections';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('Contacto y cotizaciones', 'Cotice su vehículo, maquinaria o transporte de carga. Visítenos en Av. Santiago de Surco 3573, Lima, o contáctenos por WhatsApp.', '/contacto/');

export default function ContactPage() {
  return <><ManagedIntro path="/contacto/" label="Contacto"/><section className="section soft"><div className="container contact-layout"><Suspense fallback={<p>Cargando formulario de cotización…</p>}><QuoteForm/></Suspense><Contact/></div></section></>;
}
