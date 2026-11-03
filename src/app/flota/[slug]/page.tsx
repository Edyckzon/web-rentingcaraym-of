import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, MessageCircle } from 'lucide-react';
import { fleet, vehicleMessage } from '@/lib/fleet';
import { whatsappLink } from '@/lib/business';
import { pageMetadata } from '@/lib/seo';
import { VehicleCard } from '@/components/Catalog';
import VehicleGallery from '@/components/VehicleGallery';
import TechnicalDetails, { VehicleIdentity } from '@/components/TechnicalDetails';

export const dynamicParams = false;
export function generateStaticParams() { return fleet.map(vehicle => ({ slug: vehicle.id })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const vehicle = fleet.find(item => item.id === slug);
  return vehicle ? pageMetadata(`Alquiler de ${vehicle.name}`, `Alquile un ${vehicle.name} con Renting Car A&M. Consulte características, disponibilidad y condiciones. Solicite su cotización.`, `/flota/${slug}/`) : {};
}
export default async function VehiclePage({ params }: Props) {
  const { slug } = await params;
  const vehicle = fleet.find(item => item.id === slug);
  if (!vehicle) notFound();
  const similar = fleet.filter(item => item.category === vehicle.category && item.id !== vehicle.id).slice(0, 3);
  const related = similar.length ? similar : fleet.filter(item => item.id !== vehicle.id).slice(0, 3);
  return <>
    <section className="section container detail-section">
      <Link className="back-link" href="/flota/"><ArrowLeft size={17}/>Volver a la flota</Link>
      <div className="detail-grid vehicle-detail-layout">
        <VehicleGallery key={vehicle.id} name={vehicle.name} images={vehicle.images}/>
        <div className="detail-copy">
          <p className="eyebrow">{vehicle.category}</p><h1>{vehicle.name}</h1>
          {vehicle.referenceSheet && <VehicleIdentity sheet={vehicle.referenceSheet}/>}
          <p className="lead">{vehicle.description}</p>
          {vehicle.dailyRate !== undefined && <p className="price">Desde S/ {vehicle.dailyRate} por día</p>}
          <div className="button-row">
            <Link className="button accent" href={`/contacto/?servicio=vehiculos&modelo=${vehicle.id}#cotizacion`}>Solicitar cotización <ArrowUpRight size={18}/></Link>
            <a className="button secondary" href={whatsappLink(vehicleMessage(vehicle))} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>WhatsApp</a>
          </div>
          <div className="detail-note"><h2>Una cotización a su medida</h2><p>La propuesta detalla tarifa, requisitos, garantía, kilometraje y coberturas. Confirme disponibilidad y condiciones con nuestro equipo.</p></div>
        </div>
        {vehicle.referenceSheet && <div className="detail-specifications"><TechnicalDetails sheet={vehicle.referenceSheet} showIdentity={false}/></div>}
        {!!vehicle.specifications?.length && <dl className="spec-table detail-specifications">{vehicle.specifications.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>}
      </div>
    </section>
    <section className="section soft"><div className="container"><div className="section-heading"><div><p className="eyebrow">Siga explorando</p><h2>{similar.length ? 'Otros vehículos similares' : 'Explore otras opciones'}</h2></div></div><div className="vehicle-grid">{related.map(item => <VehicleCard key={item.id} vehicle={item}/>)}</div></div></section>
  </>;
}
