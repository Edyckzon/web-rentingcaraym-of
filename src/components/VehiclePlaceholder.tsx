import { CarFront } from 'lucide-react';

export default function VehiclePlaceholder({ name }: { name: string }) {
  return <div className="vehicle-placeholder" role="img" aria-label={`Fotografías de ${name} pendientes`}>
    <CarFront size={52} strokeWidth={1.3} aria-hidden="true"/>
    <span>Fotografías pendientes</span>
  </div>;
}
