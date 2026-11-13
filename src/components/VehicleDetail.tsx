'use client';
import {useMarketing} from '@/components/MarketingProvider';
import {ContentText,ContentLink} from '@/components/ContentText';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CalendarDays, ClipboardList, Fuel, MessageCircle, Settings2 } from 'lucide-react';
import { vehicleMessage } from '@/lib/fleet';
import { VehicleCard } from '@/components/Catalog';
import VehicleGallery from '@/components/VehicleGallery';
import RentalCalculator from './RentalCalculator';
import { fleetCategories } from '@/lib/catalog-profile';
import { formatSoles } from '@/lib/rental-pricing.mjs';
import RentalPrice from './RentalPrice';

const specificationIcons = new Map([
  ['Año', CalendarDays],
  ['Transmisión', Settings2],
  ['Combustible', Fuel],
]);

export default function VehicleDetail({slug}:{slug:string}){
 const {fleet,whatsappLink,loaded,block}=useMarketing();const conditions=block('vehicle-conditions');
  const vehicle = fleet.find(item => item.id === slug);
  if (!vehicle) return <section className="section container"><h1>{loaded?'Vehículo no disponible':'Cargando vehículo…'}</h1><Link href="/flota/">Ver flota</Link></section>;
  const similar = fleet.filter(item => item.categories.some(category => vehicle.categories.includes(category)) && item.id !== vehicle.id).slice(0, 3);
  const category = fleetCategories.find(item => item.name === vehicle.category);
  const related = similar.length ? similar : fleet.filter(item => item.id !== vehicle.id).slice(0, 3);
  return <>
    <section className="section container detail-section" data-vehicle-detail data-modelo={vehicle.id} data-categoria={vehicle.category}>
      <Link className="back-link" href="/flota/"><ArrowLeft size={17}/>Volver a la flota</Link>
      {category && <nav className="vehicle-breadcrumb" aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span>/</span><Link href="/flota/">Flota</Link><span>/</span><Link href={`/flota/${category.slug}/`}>{category.name}</Link><span>/</span><span aria-current="page">{vehicle.name}</span></nav>}
      <div className="detail-grid vehicle-detail-layout">
        <div className="vehicle-detail-overview">
          <VehicleGallery key={vehicle.id} name={vehicle.name} images={vehicle.images}/>
          {!!vehicle.specifications?.length && <section aria-labelledby="vehicle-spec-title">
            <h2 id="vehicle-spec-title">Ficha técnica</h2>
            <dl className="vehicle-detail-specs">{vehicle.specifications.map(({ label, value }) => {
              const Icon = specificationIcons.get(label) ?? ClipboardList;
              return <div key={label}>
                <dt><Icon size={17} aria-hidden="true"/>{label}</dt>
                <dd>{value}</dd>
              </div>;
            })}</dl>
          </section>}
          {vehicle.idealFor && <section className="vehicle-detail-use">
            <h2>Ideal para</h2>
            <ContentText text={vehicle.idealFor}/>
          </section>}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{vehicle.category}</p><h1>Alquiler de {vehicle.name}{vehicle.profile.year ? ` ${vehicle.profile.year}` : ''} en Lima</h1>

          <p className="lead">{vehicle.description}</p>
          <RentalPrice rates={vehicle.rates} vehicleId={vehicle.id}/>
          {vehicle.rates?.daily != null && <p className="rental-regular">Tarifa diaria regular: {formatSoles(vehicle.rates.daily)} · IGV incluido</p>}
          <RentalCalculator key={vehicle.id} vehicle={vehicle}/>
          <div className="button-row">
            <Link className="button accent" href={`/contacto/?servicio=vehiculos&modelo=${vehicle.id}#cotizacion`}>Solicitar cotización <ArrowUpRight size={18}/></Link>
            <a className="button secondary" href={whatsappLink(vehicleMessage(vehicle))} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>WhatsApp</a>
          </div>
          <div className="detail-note"><h2>{conditions.title}</h2><ContentText text={conditions.body}/><ContentLink block={conditions}/></div>
        </div>
      </div>
    </section>
    <section className="section soft"><div className="container"><div className="section-heading"><div><p className="eyebrow">Siga explorando</p><h2>{similar.length ? vehicle.category==='SUV'?'Otras camionetas SUV en alquiler':vehicle.category==='Sedán'?'Otros sedanes en alquiler':'Otros autos familiares en alquiler' : 'Explore otras opciones'}</h2></div></div><div className="vehicle-grid">{related.map(item => <VehicleCard key={item.id} vehicle={item}/>)}</div></div></section>
  </>;
}
