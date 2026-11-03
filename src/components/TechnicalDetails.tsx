import type { TechnicalSheet } from '@/lib/technicalSheets';
import { CalendarDays, Cog, Gauge, RotateCw, Settings2, Users, Fuel, Cylinder, BriefcaseBusiness, Route } from 'lucide-react';

export function VehicleIdentity({ sheet }: { sheet: TechnicalSheet }) {
  if (!sheet.year) return null;
  return <div className="vehicle-identity" aria-label="Año y transmisión de la unidad">
    <span><CalendarDays size={17} aria-hidden="true"/>{sheet.year}</span>
    <span><Settings2 size={17} aria-hidden="true"/>{sheet.transmission}</span>
  </div>;
}

const fieldIcons = {
  Motor: Cog, Potencia: Gauge, Torque: RotateCw, Transmisión: Settings2,
  Plazas: Users, Tanque: Fuel, Cilindros: Cylinder, Maletero: BriefcaseBusiness, Tracción: Route,
};

export default function TechnicalDetails({ sheet, compact = false, showIdentity = true }: { sheet: TechnicalSheet; compact?: boolean; showIdentity?: boolean }) {
  const entries = Object.entries(sheet.fields);
  return <section className={`technical-details${compact ? ' compact' : ''}`} aria-label="Motor y características">
    <h3>Motor y características</h3>
    {showIdentity && <VehicleIdentity sheet={sheet}/>}
    <p className="version-label">{sheet.version} · Perú</p>
    <dl className="tech-grid">{(compact ? entries.slice(0, 3) : entries).map(([label, value]) => {
      const Icon = fieldIcons[label as keyof typeof fieldIcons] || Cog;
      return <div key={label}><dt><Icon size={24} strokeWidth={1.5} aria-hidden="true"/><span>{label}</span></dt><dd>{value}</dd></div>;
    })}</dl>
    <p className="tech-note">{sheet.year ? 'Año y transmisión confirmados por A&M. ' : ''}Las cifras de motor corresponden a la versión técnica indicada; confirme el acabado y equipamiento al cotizar.</p>
    <a className="tech-source" href={sheet.source} target="_blank" rel="noopener noreferrer">Fuente: {sheet.publisher} ↗</a>
  </section>;
}
