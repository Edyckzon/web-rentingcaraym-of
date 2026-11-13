'use client';

import { useRef, useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import { downloadImage } from '@/lib/image-download.mjs';

export default function ImageDownload({ src, name, label = 'Descargar imagen', onNotice }: {
  src: string;
  name: string;
  label?: string;
  onNotice: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const pending = useRef(false);
  async function download() {
    if (pending.current) return;
    pending.current = true;
    setLoading(true);
    onNotice('');
    try {
      await downloadImage(src, name);
      onNotice('Descarga iniciada. Revisa las descargas de tu navegador.');
    } catch (error) {
      onNotice(error instanceof Error && error.name !== 'TimeoutError' && error.name !== 'TypeError'
        ? error.message : 'No se pudo descargar la imagen. Revisa tu conexión y vuelve a intentarlo.');
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }
  const Icon = loading ? LoaderCircle : Download;
  return <button type="button" className="image-download" disabled={loading || !src}
    aria-busy={loading} aria-label={`${label}: ${name}`} onClick={() => void download()}>
    <Icon size={16} className={loading ? 'toast-spinner' : undefined} aria-hidden="true"/>
    {loading ? 'Descargando…' : label}
  </button>;
}
