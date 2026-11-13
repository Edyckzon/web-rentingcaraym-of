'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MapPin, Play, X } from 'lucide-react';
import './office-journey.css';

export default function OfficeJourney() {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const pause = () => { if (document.hidden) video.current?.pause(); };
    document.addEventListener('visibilitychange', pause);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('visibilitychange', pause);
    };
  }, [open]);

  function close() {
    video.current?.pause();
    dialog.current?.close();
    setOpen(false);
    trigger.current?.focus();
  }

  function show() {
    setLoaded(true);
    setOpen(true);
    dialog.current?.showModal();
  }

  return <>
    <button ref={trigger} className="journey-trigger" type="button" onClick={show} aria-haspopup="dialog">
      <span className="journey-play"><Play size={16} fill="currentColor" aria-hidden="true"/></span>
      <span>De la Tierra a nuestra sede <small>Ver recorrido · 24 s</small></span>
      <ArrowUpRight size={18} aria-hidden="true"/>
    </button>
    <dialog ref={dialog} className="journey-dialog" aria-labelledby="journey-title"
      onCancel={event => { event.preventDefault(); close(); }} onClose={() => { video.current?.pause(); setOpen(false); }}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="journey-shell">
        <header className="journey-heading">
          <div><p>RENTING CAR A&M</p><h2 id="journey-title">El viaje empieza en Surco.</h2></div>
          <button type="button" onClick={close} className="journey-close" aria-label="Cerrar recorrido" autoFocus><X size={22} aria-hidden="true"/></button>
        </header>
        {loaded && <video ref={video} controls playsInline preload="metadata" poster="/brand/journey/v2/poster.jpg"
          width={1920} height={1080} aria-label="Recorrido desde la Tierra entre nubes hasta la oficina de A&M, con el auto rojo y una asesora saludando"
          onError={() => setFailed(true)}>
          <source src="/brand/journey/tierra-a-surco-v2.mp4" type="video/mp4"/>
          Su navegador no puede reproducir este video.
        </video>}
        {failed && <p role="status" className="journey-error">No se pudo cargar el recorrido. Puede visitar nuestra ubicación en el mapa.</p>}
        <footer className="journey-footer">
          <div><MapPin size={19} aria-hidden="true"/><p><strong>Av. Santiago de Surco 3573</strong><span>Surco, Lima · Perú</span></p></div>
          <a href="https://www.google.com/maps/search/?api=1&query=-12.1339962%2C-76.9971472" target="_blank" rel="noopener noreferrer">Cómo llegar <ArrowUpRight size={17} aria-hidden="true"/></a>
        </footer>
        <p className="journey-caption">Recreación visual con IA y animación por capas. Fachada basada en la referencia de Google Street View; vehículo y asesora integrados para esta presentación.</p>
      </div>
    </dialog>
  </>;
}
