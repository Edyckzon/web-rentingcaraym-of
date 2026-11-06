'use client';
import {useMarketing,detailUrl} from '@/components/MarketingProvider';


import { useId, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Eye, X } from 'lucide-react';
import { type Vehicle, vehicleMessage } from '@/lib/fleet';

import GalleryDialog from './GalleryDialog';
import VehicleGallery from './VehicleGallery';
import TechnicalDetails, { VehicleIdentity } from './TechnicalDetails';

export default function VehiclePreview({ vehicle }: { vehicle: Vehicle }) {
  const {whatsappLink}=useMarketing();
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
      {cover && <figure className="catalog-photo"><img src={cover.src} alt={cover.alt} width={1200} height={900} loading="lazy"/>{cover.reference && <figcaption>Imagen referencial · No es la unidad ofrecida{cover.credit && <> · {cover.credit}{cover.license && ` / ${cover.license}`}</>}</figcaption>}</figure>}
      <span className="category-badge">{vehicle.category}</span><span className="eye-badge"><Eye size={20}/></span>
    </Link>
    {open && <GalleryDialog labelId={titleId} className="quick-view" onDismiss={() => setOpen(false)}>
      <div className="preview-top"><span><Eye size={18}/> Vista rápida</span><button type="button" className="gallery-icon" aria-label="Cerrar vista rápida" onClick={() => setOpen(false)}><X size={20}/></button></div>
      <div className="preview-layout"><VehicleGallery name={vehicle.name} images={vehicle.images} compact/>
        <div className="preview-info"><p className="eyebrow">{vehicle.category}</p><h2 id={titleId}>{vehicle.name}</h2>
          {vehicle.referenceSheet && <VehicleIdentity sheet={vehicle.referenceSheet}/>}
          <p>{vehicle.description}</p>
          {!!vehicle.specifications?.length && <dl className="spec-table">{vehicle.specifications.slice(0,4).map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>}
          {vehicle.dailyRate !== undefined && <p className="price">Desde S/ {vehicle.dailyRate} por día</p>}
          <div className="preview-actions">
          <Link className="button secondary" href={detail} onClick={() => setOpen(false)}>Ver ficha completa <ArrowUpRight size={17}/></Link>
          <a className="button accent" href={whatsappLink(vehicleMessage(vehicle))} target="_blank" rel="noopener noreferrer">Cotizar por WhatsApp <ArrowUpRight size={17}/></a>
          </div>
        </div>
        {vehicle.referenceSheet && <div className="preview-specifications"><TechnicalDetails sheet={vehicle.referenceSheet} compact showIdentity={false}/></div>}
      </div>
    </GalleryDialog>}
  </>;
}
