'use client';

import { resolveHomeCover } from '@/lib/home-cover';
import ImageDownload from './ImageDownload';

export default function CoverPreview({ src, onNotice }: { src: string; onNotice: (message: string) => void }) {
  const cover = resolveHomeCover(src);
  return <><div className="cover-previews">
    <figure className="cover-preview">
      <img src={cover.src} alt="Portada actual" width={cover.width} height={cover.height}/>
      <figcaption><strong>Portada de escritorio</strong><div className="image-download-actions">
        <ImageDownload src={cover.src} name="renting-car-aym-portada" onNotice={onNotice}/>
        {cover.original && <ImageDownload src={cover.original} name="renting-car-aym-portada-original" label="Original PNG" onNotice={onNotice}/>}
      </div></figcaption>
    </figure>
    {cover.mobile && <figure className="cover-preview cover-preview-mobile">
      <img src={cover.mobile.src} alt="Versión de la portada para celulares" width={cover.mobile.width} height={cover.mobile.height}/>
      <figcaption><strong>Portada de celular</strong><div className="image-download-actions">
        <ImageDownload src={cover.mobile.src} name="renting-car-aym-portada-movil" onNotice={onNotice}/>
        <ImageDownload src={cover.mobile.original} name="renting-car-aym-portada-movil-original" label="Original PNG" onNotice={onNotice}/>
      </div></figcaption>
    </figure>}
  </div><details className="brand-downloads">
    <summary>Descargar recursos de marca</summary>
    <div className="brand-download-grid">{[
      { src: '/brand/logo.png', name: 'Logo Renting Car A&M' },
      { src: '/brand/asesora-renting.webp', name: 'Asesora Renting Car A&M' },
      { src: '/brand/journey/v2/advisor-wave.png', name: 'Asesora saludando' },
      { src: '/brand/journey/v2/escena-final.jpg', name: 'Escena de la sede' },
    ].map(image => <figure key={image.src}>
      <img src={image.src} alt={image.name} loading="lazy"/>
      <figcaption><strong>{image.name}</strong><ImageDownload src={image.src} name={image.name} onNotice={onNotice}/></figcaption>
    </figure>)}</div>
  </details></>;
}
