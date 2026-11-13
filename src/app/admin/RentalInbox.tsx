'use client';

import { useEffect, useState } from 'react';
import { formatSoles } from '@/lib/rental-pricing.mjs';

type RentalRequest = {
  id: string; creado_en: string; vehiculo_id: string; nombre: string; telefono: string;
  correo: string; documento: string; comentario: string; notificado_en: string | null;
  detalle: { vehicle: string; pickup: string; dropoff: string; days: number; total: number | null; place: string };
};

const date = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima' });

export default function RentalInbox({ api }: { api: (path: string) => Promise<string> }) {
  const [rows, setRows] = useState<RentalRequest[]>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api('rental-inbox').then(raw => { if (active) setRows(JSON.parse(raw)); })
      .catch(error => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [api]);
  if (error) return <p role="alert">{error}</p>;
  if (!rows) return <p role="status">Cargando solicitudes…</p>;
  if (!rows.length) return <p>Aún no hay solicitudes registradas.</p>;
  return <div className="rental-inbox">{rows.map(row => <details key={row.id}>
    <summary>{row.detalle.vehicle} · {row.nombre} · {date.format(new Date(row.creado_en))}</summary>
    <p>{row.telefono}{row.correo && ` · ${row.correo}`}</p>
    {row.documento && <p>Documento: {row.documento}</p>}
    <p>{row.detalle.pickup.replace('T',' ')} a {row.detalle.dropoff.replace('T',' ')} · {row.detalle.days} días</p>
    <p>Entrega: {row.detalle.place === 'surco' ? 'Local Surco' : 'Otro punto en Lima'}</p>
    <p>Total estimado: {row.detalle.total === null ? 'Por consultar' : formatSoles(row.detalle.total)}</p>
    {row.comentario && <p>{row.comentario}</p>}
    <p>{row.notificado_en ? 'Correo notificado' : 'Notificación por correo pendiente'}</p>
  </details>)}</div>;
}
