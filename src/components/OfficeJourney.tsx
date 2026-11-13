'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, X } from 'lucide-react';
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
    <button ref={trigger} className="journey-trigger" type="button" onClick={show} aria-haspopup="dialog" aria-label="Reproducir video">
      <Play size={20} fill="currentColor" aria-hidden="true"/>
    </button>
    <dialog ref={dialog} className="journey-dialog" aria-label="Video de Renting Car A&M"
      onCancel={event => { event.preventDefault(); close(); }} onClose={() => { video.current?.pause(); setOpen(false); }}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="journey-shell">
        <button type="button" onClick={close} className="journey-close" aria-label="Cerrar video" autoFocus><X size={22} aria-hidden="true"/></button>
        {loaded && <video ref={video} controls playsInline preload="metadata" poster="/brand/journey/gemini-poster.jpg"
          width={1280} height={720} aria-label="Video de Renting Car A&M"
          onError={() => setFailed(true)}>
          <source src="/brand/journey/renting-aym-gemini.mp4" type="video/mp4"/>
          Su navegador no puede reproducir este video.
        </video>}
        {failed && <p role="status" className="journey-error">No se pudo cargar el video. Cierra y vuelve a intentarlo.</p>}
      </div>
    </dialog>
  </>;
}
