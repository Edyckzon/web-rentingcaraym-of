'use client';
import {useMarketing,detailUrl} from '@/components/MarketingProvider';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { type Vehicle, vehicleMessage } from '@/lib/fleet';

import type { CatalogImage } from '@/lib/media';
import { heavyServices } from '@/lib/services';
import VehiclePreview from './VehiclePreview';
import { VehicleIdentity } from './TechnicalDetails';

export function Photo({ photo, priority = false, className = '' }: { photo: CatalogImage; priority?: boolean; className?: string }) {
  return <figure className={`catalog-photo ${className}`}><img src={photo.src} alt={photo.alt} width={1200} height={800} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'}/>{photo.reference && <figcaption>Imagen referencial · No es la unidad ofrecida</figcaption>}</figure>;
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const {whatsappLink}=useMarketing();
  return <article className="vehicle-card">
    <VehiclePreview vehicle={vehicle}/>
    <div className="vehicle-info"><p className="eyebrow">Renting Car A&M</p><h3>{vehicle.name}</h3>{vehicle.referenceSheet && <VehicleIdentity sheet={vehicle.referenceSheet}/>}<p className="card-description">Cotización según sus fechas y necesidades.</p>
      {vehicle.specifications && <ul className="compact-specs">{vehicle.specifications.slice(0, 4).map(spec => <li key={spec.label}>{spec.label}: {spec.value}</li>)}</ul>}
      {vehicle.dailyRate !== undefined && <p className="price">Desde S/ {vehicle.dailyRate} por día</p>}
      <div className="card-actions"><Link className="button secondary" href={detailUrl(vehicle.id)}>Ver {vehicle.name} en alquiler</Link><a className="button accent" href={whatsappLink(vehicleMessage(vehicle))} target="_blank" rel="noopener noreferrer" aria-label={`Cotizar alquiler de ${vehicle.name}`}>Cotizar <ArrowUpRight size={17}/></a></div>
    </div>
  </article>;
}

export function ServiceCards() {
  return <div className="vehicle-grid">{heavyServices.map(service => <article className="vehicle-card service-card" key={service.id}>
    <Link className="card-image-link" href={`/maquinaria-y-transporte/${service.id}/`} aria-label={`Ver ${service.name}`}><Photo photo={service.images[0]}/><span className="category-badge">Línea pesada</span></Link>
    <div className="vehicle-info"><p className="eyebrow">{service.equipment}</p><h3>{service.name}</h3><p>{service.description}</p><Link className="text-link" href={`/maquinaria-y-transporte/${service.id}/`}>Ver servicio <ArrowUpRight size={18}/></Link></div>
  </article>)}</div>;
}
