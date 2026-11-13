import { vehicleSlug, vehicleId } from '@/lib/vehicle-routes';
import VehicleDetail from '@/components/VehicleDetail';
import FleetFilter from '@/components/FleetFilter';
import { Closing, PageIntro } from '@/components/Sections';
import { fleet } from '@/lib/fleet';
import { fleetCategories } from '@/lib/catalog-profile';
import { pageMetadata } from '@/lib/seo';
import { business } from '@/lib/business';
import JsonLd from '@/components/JsonLd';
import BreadcrumbData from '@/components/BreadcrumbData';

const fleetCrumb = { name: 'Flota', path: '/flota/' };

export const dynamicParams = false;
export function generateStaticParams() {
  return [...new Set([...fleetCategories.map(category => category.slug), ...fleet.map(vehicle => vehicleSlug(vehicle.id))])]
    .map(slug => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = fleetCategories.find(item => item.slug === slug);
  if (category) {
    const metadata = pageMetadata(category.title, category.description, `/flota/${slug}/`);
    return fleet.some(vehicle => vehicle.categories.includes(category.name)) ? metadata : { ...metadata, robots: { index: false, follow: true } };
  }
  const vehicle = fleet.find(item => item.id === vehicleId(slug));
  return vehicle ? pageMetadata(vehicle.seoTitle || `Alquiler de ${vehicle.name} en Lima`, vehicle.seoDescription || `Alquile un ${vehicle.name} con Renting Car A&M. Consulte características, disponibilidad y condiciones.`, `/flota/${slug}/`) : {};
}

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params;
  const category = fleetCategories.find(item => item.slug === slug);
  if (category) return <><BreadcrumbData trail={[fleetCrumb, { name: category.name, path: `/flota/${slug}/` }]}/>
    <PageIntro label="Flota de vehículos" title={category.title} description={category.description}/>
    <section className="section soft"><div className="container"><FleetFilter category={category.name}/></div></section><Closing/></>;
  const vehicle = fleet.find(item => item.id === vehicleId(slug));
  const primary = fleetCategories.find(item => item.name === vehicle?.category);
  const path = `/flota/${slug}/`;
  const url = `${business.siteUrl}${path}`;
  const crumbs = [fleetCrumb, ...(primary ? [{ name: primary.name, path: `/flota/${primary.slug}/` }] : [])];
  return <>
    {vehicle && <BreadcrumbData trail={[...crumbs, { name: vehicle.name, path }]}/>}
    {vehicle && <JsonLd data={{
      '@context':'https://schema.org', '@type':'Product', name:vehicle.name,
      description:vehicle.description, url,
      ...(vehicle.images.length ? { image:vehicle.images.map(photo => new URL(photo.src, business.siteUrl).href) } : {}),
      ...(vehicle.rates?.daily != null ? { offers:{ '@type':'Offer', priceCurrency:'PEN', price:vehicle.rates.daily / 100,
        url, description:'Tarifa diaria regular. Consulte disponibilidad y tramos.' } } : {}),
    }}/>}
    <VehicleDetail slug={vehicleId(slug)}/>
  </>;
}
