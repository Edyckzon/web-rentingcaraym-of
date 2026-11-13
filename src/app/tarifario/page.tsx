import RentalTariff from '@/components/RentalTariff';
import BreadcrumbData from '@/components/BreadcrumbData';
import { pageMetadata } from '@/lib/seo';

const path = '/tarifario/';
export const metadata = pageMetadata(
  'Tarifario de alquiler de autos en Lima',
  'Compare tarifas diarias, semanales y mensuales por modelo. Revise la garantía y cotice sus fechas con Renting Car A&M.',
  path,
);

export default function TariffPage() {
  return <><BreadcrumbData trail={[{ name: 'Tarifario', path }]}/><RentalTariff/></>;
}
