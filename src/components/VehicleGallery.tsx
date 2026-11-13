'use client';

import { useId, useRef, useState, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, Expand, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { CatalogImage } from '@/lib/media';
import GalleryDialog from './GalleryDialog';
import VehiclePlaceholder from './VehiclePlaceholder';

export default function VehicleGallery({ images, name, compact = false }: {
  images: CatalogImage[]; name: string; compact?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const titleId = useId();
  const photo = images[index];
  if (!photo) return <VehiclePlaceholder name={name}/>;
  const multiple = images.length > 1;
  function select(next: number) {
    setIndex((next + images.length) % images.length);
    setZoomed(false);
  }
  function touchStart(event: TouchEvent) {
    start.current = !zoomed && event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }
  function touchEnd(event: TouchEvent) {
    const point = start.current;
    start.current = null;
    if (!point || !multiple) return;
    const dx = event.changedTouches[0].clientX - point.x;
    const dy = event.changedTouches[0].clientY - point.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) select(index + (dx < 0 ? 1 : -1));
  }
  function close() { setExpanded(false); setZoomed(false); }
  const controls = multiple && <div className="gallery-arrows">
    <button type="button" className="gallery-icon" aria-label="Foto anterior" onClick={() => select(index - 1)}><ChevronLeft/></button>
    <span aria-live="polite">{index + 1} / {images.length}</span>
    <button type="button" className="gallery-icon" aria-label="Foto siguiente" onClick={() => select(index + 1)}><ChevronRight/></button>
  </div>;
  const caption = photo.reference ? 'Imagen referencial · No es la unidad ofrecida' : photo.alt;
  return <section className="vehicle-gallery" aria-label={`Galería de ${name}`} onKeyDown={event => {
    if (zoomed || !multiple || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); select(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  }}>
    <figure className="gallery-stage" onTouchStart={touchStart} onTouchEnd={touchEnd} onTouchCancel={() => { start.current = null; }}>
      <img src={photo.src} alt={photo.alt} width={1200} height={900}/>
      {!compact && <button className="gallery-expand" type="button" onClick={() => setExpanded(true)} aria-haspopup="dialog" aria-label={`Ampliar foto de ${name}`}><Expand size={18}/><span>Ampliar</span></button>}
      <figcaption>{caption}{photo.credit && <> · {photo.credit}{photo.license && ` / ${photo.license}`}</>}</figcaption>
    </figure>
    {photo.sourceUrl && <small><a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">Fuente: {photo.credit}</a>{photo.licenseUrl && <> · <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license}</a></>}</small>}
    {multiple && <><div className="gallery-bar"><span>Galería de fotos</span>{controls}</div>
      <div className="gallery-thumbs" role="group" aria-label="Seleccionar fotografía">
        {images.map((image, i) => <button type="button" key={image.src} aria-label={`Ver foto ${i + 1}: ${image.alt}`} aria-pressed={i === index} onClick={() => select(i)}>
          <img src={image.src} alt="" width={80} height={60} loading="lazy"/>
        </button>)}
      </div></>}
    {expanded && <GalleryDialog labelId={titleId} className="photo-viewer" onDismiss={close}>
      <div className="viewer-header"><h2 id={titleId}>{name}</h2><button type="button" className="gallery-icon" onClick={close} aria-label="Cerrar foto ampliada"><X/></button></div>
      <div key={index} className={`viewer-viewport${zoomed ? ' zoomed' : ''}`} onTouchStart={touchStart} onTouchEnd={touchEnd} onTouchCancel={() => { start.current = null; }} tabIndex={zoomed ? 0 : undefined} aria-label="Fotografía ampliada">
        <img src={photo.src} alt={photo.alt}/>
      </div>
      <div className="viewer-footer"><p>{caption}{photo.credit && <> · {photo.credit}{photo.license && ` / ${photo.license}`}</>}</p>{controls}
        <button className="viewer-zoom" type="button" aria-pressed={zoomed} onClick={() => setZoomed(!zoomed)}>{zoomed ? <ZoomOut size={18}/> : <ZoomIn size={18}/>} {zoomed ? 'Ajustar' : 'Zoom 2×'}</button>
      </div>
    </GalleryDialog>}
  </section>;
}
