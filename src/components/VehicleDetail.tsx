'use client';
import {useMarketing} from '@/components/MarketingProvider';
import {ContentText,ContentLink} from '@/components/ContentText';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, MessageCircle } from 'lucide-react';
import { vehicleMessage } from '@/lib/fleet';
import { VehicleCard } from '@/components/Catalog';
import VehicleGallery from '@/components/VehicleGallery';
import TechnicalDetails, { VehicleIdentity } from '@/components/TechnicalDetails';

export default function VehicleDetail({slug}:{slug:string}){
 const {fleet,whatsappLink,loaded,block}=useMarketing();const conditions=block('vehicle-conditions');
  const vehicle = fleet.find(item => item.id === slug);
  if (!vehicle) return <section className="section container"><h1>{loaded?'Vehículo no disponible':'Cargando vehículo…'}</h1><Link href="/flota/">Ver flota</Link></section>;
  const similar = fleet.filter(item => item.category === vehicle.category && item.id !== vehicle.id).slice(0, 3);
  const related = similar.length ? similar : fleet.filter(item => item.id !== vehicle.id).slice(0, 3);
  return <>
    <section className="section container detail-section">
      <Link className="back-link" href="/flota/"><ArrowLeft size={17}/>Volver a la flota</Link>
      <div className="detail-grid vehicle-detail-layout">
        <VehicleGallery key={vehicle.id} name={vehicle.name} images={vehicle.images}/>
        <div className="detail-copy">
          <p className="eyebrow">{vehicle.category}</p><h1>Alquiler de {vehicle.name} en Lima</h1>
          {vehicle.referenceSheet && <VehicleIdentity sheet={vehicle.referenceSheet}/>}
          <p className="lead">{vehicle.description}</p>
          {vehicle.dailyRate !== undefined && <p className="price">Desde S/ {vehicle.dailyRate} por día</p>}
          <div className="button-row">
            <Link className="button accent" href={`/contacto/?servicio=vehiculos&modelo=${vehicle.id}#cotizacion`}>Solicitar cotización <ArrowUpRight size={18}/></Link>
            <a className="button secondary" href={whatsappLink(vehicleMessage(vehicle))} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>WhatsApp</a>
          </div>
          <div className="detail-note"><h2>{conditions.title}</h2><ContentText text={conditions.body}/><ContentLink block={conditions}/></div>
        </div>
        {vehicle.referenceSheet && <div className="detail-specifications"><TechnicalDetails sheet={vehicle.referenceSheet} showIdentity={false}/></div>}
        {vehicle.idealFor&&<section className="detail-specifications"><h2>Ideal para</h2><p style={{whiteSpace:"pre-line"}}>{vehicle.idealFor}</p></section>}
        {!!vehicle.specifications?.length && <dl className="spec-table detail-specifications">{vehicle.specifications.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>}
      </div>
    </section>
    <section className="section soft"><div className="container"><div className="section-heading"><div><p className="eyebrow">Siga explorando</p><h2>{similar.length ? vehicle.category==='SUV'?'Otras camionetas SUV en alquiler':vehicle.category==='Sedán'?'Otros sedanes en alquiler':'Otros autos familiares en alquiler' : 'Explore otras opciones'}</h2></div></div><div className="vehicle-grid">{related.map(item => <VehicleCard key={item.id} vehicle={item}/>)}</div></div></section>
  </>;
}
