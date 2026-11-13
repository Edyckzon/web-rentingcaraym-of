'use client';
import {detailUrl} from '@/components/MarketingProvider';


import { useId, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Eye, X } from 'lucide-react';
import type { Vehicle } from '@/lib/fleet';
import RentalPrice from './RentalPrice';

import GalleryDialog from './GalleryDialog';
import VehicleGallery from './VehicleGallery';
import VehiclePlaceholder from './VehiclePlaceholder';

export default function VehiclePreview({ vehicle }: { vehicle: Vehicle }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const detail = detailUrl(vehicle.id);
  const cover = vehicle.images[0];
  return <>
    <Link href={detail} className="card-image-link preview-trigger" aria-label={`Vista rápida de ${vehicle.name}`} aria-haspopup="dialog"
      onClick={event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); setOpen(true);
      }}>
      {cover ? <figure className="catalog-photo"><img src={cover.src} alt={cover.alt} width={1200} height={900} loading="lazy"/></figure> : <VehiclePlaceholder name={vehicle.name}/>}
      <span className="category-badge">{vehicle.category}</span><span className="eye-badge"><Eye size={20}/></span>
    </Link>
    {open && <GalleryDialog labelId={titleId} className="quick-view" onDismiss={() => setOpen(false)}>
      <div className="preview-top"><span><Eye size={18}/> Vista rápida</span><button type="button" className="gallery-icon" aria-label="Cerrar vista rápida" onClick={() => setOpen(false)}><X size={20}/></button></div>
      <div className="preview-layout"><VehicleGallery name={vehicle.name} images={vehicle.images} compact/>
        <div className="preview-info"><p className="eyebrow">{vehicle.category}</p><h2 id={titleId}>{vehicle.name}</h2>

          <p>{vehicle.description}</p>
          {!!vehicle.specifications?.length && <dl className="spec-table">{vehicle.specifications.slice(0,4).map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>}
          <RentalPrice rates={vehicle.rates} vehicleId={vehicle.id}/>
          <div className="preview-actions">
          <Link className="button secondary" href={detail} onClick={() => setOpen(false)}>Ver ficha completa <ArrowUpRight size={17}/></Link>
          <Link className="button accent" href={`${detail}#cotizador`} onClick={() => setOpen(false)}>Cotizar <ArrowUpRight size={17}/></Link>
          </div>
        </div>
      </div>
    </GalleryDialog>}
  </>;
}
