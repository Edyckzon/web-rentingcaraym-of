import {vehicleSlug,vehicleId} from '@/lib/vehicle-routes';
import VehicleDetail from '@/components/VehicleDetail';
import {fleet} from '@/lib/fleet';
import {pageMetadata} from '@/lib/seo';
export const dynamicParams = false;
export function generateStaticParams() { return fleet.map(vehicle => ({ slug: vehicleSlug(vehicle.id) })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const vehicle = fleet.find(item => item.id === vehicleId(slug));
  return vehicle ? pageMetadata(vehicle.seoTitle || `Alquiler de ${vehicle.name} en Lima`, vehicle.seoDescription || `Alquile un ${vehicle.name} con Renting Car A&M. Consulte características, disponibilidad y condiciones. Solicite su cotización.`, `/flota/${slug}/`) : {};
}
export default async function VehiclePage({ params }: Props) {
  const { slug } = await params;
  return <VehicleDetail slug={vehicleId(slug)}/>;
}
