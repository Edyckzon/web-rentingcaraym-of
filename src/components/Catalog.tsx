'use client';
import {detailUrl} from '@/components/MarketingProvider';
import Link from 'next/link';
import { ArrowUpRight, ImageOff } from 'lucide-react';
import type { Vehicle } from '@/lib/fleet';
import RentalPrice from './RentalPrice';
import ServicePrice from './ServicePrice';

import type { CatalogImage } from '@/lib/media';
import { heavyServices } from '@/lib/services';
import VehiclePreview from './VehiclePreview';

export function Photo({ photo, priority = false, className = '' }: { photo: CatalogImage; priority?: boolean; className?: string }) {
  if (photo.reference) return <div className={`vehicle-placeholder ${className}`} role="img" aria-label="Fotografía del equipo pendiente"><ImageOff aria-hidden="true" size={36}/><span>Fotografía pendiente</span></div>;
  return <figure className={`catalog-photo ${className}`}><img src={photo.src} alt={photo.alt} width={1200} height={800} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'}/>{photo.reference && <figcaption>Imagen referencial · No es la unidad ofrecida</figcaption>}</figure>;
}

export function VehicleCard({ vehicle, dates }: { vehicle: Vehicle; dates?: { pickup: string; dropoff: string; place: string } }) {
  const detail = detailUrl(vehicle.id);
  const destination = detail.split('?')[0];
  const params = new URLSearchParams(detail.split('?')[1]);
  if (dates?.pickup) params.set('recojo', dates.pickup);
  if (dates?.dropoff) params.set('devolucion', dates.dropoff);
  if (dates?.place) params.set('entrega', dates.place);
  const quoteUrl = `${destination}${params.size ? `?${params}` : ''}#cotizador`;
  return <article className="vehicle-card" data-modelo={vehicle.id}>
    <VehiclePreview vehicle={vehicle}/>
    <div className="vehicle-info"><p className="eyebrow">Renting Car A&M</p><h3>{vehicle.name}</h3><p className="card-description">Cotización según sus fechas y necesidades.</p>
      {vehicle.specifications && <ul className="compact-specs">{vehicle.specifications.slice(0, 4).map(spec => <li key={spec.label}>{spec.label}: {spec.value}</li>)}</ul>}
      <RentalPrice rates={vehicle.rates} vehicleId={vehicle.id}/>
      <div className="card-actions"><Link className="button accent" href={quoteUrl} data-origen="tarjeta" aria-label={`Cotizar alquiler de ${vehicle.name}`}>Cotizar <ArrowUpRight size={17}/></Link><Link className="button secondary" href={detail} aria-label={`Ver detalles de ${vehicle.name}`}>Ver detalles</Link></div>
    </div>
  </article>;
}

export function ServiceCards() {
  return <div className="vehicle-grid">{heavyServices.map(service => <article className="vehicle-card service-card" key={service.id}>
    <Link className="card-image-link" href={`/maquinaria-y-transporte/${service.id}/`} aria-label={`Ver ${service.name}`}><Photo photo={service.images[0]}/><span className="category-badge">Línea pesada</span></Link>
    <div className="vehicle-info"><p className="eyebrow">{service.equipment}</p><h3>{service.name}</h3><p>{service.description}</p><ServicePrice service={service.id}/><Link className="text-link" href={`/maquinaria-y-transporte/${service.id}/`}>Ver servicio <ArrowUpRight size={18}/></Link></div>
  </article>)}</div>;
}
