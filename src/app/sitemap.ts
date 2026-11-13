import type { MetadataRoute } from 'next';
import { business } from '@/lib/business';
import { fleetCategories } from '@/lib/catalog-profile';
import { fleet } from '@/lib/fleet';
import { heavyServices } from '@/lib/services';
import {vehicleSlug} from '@/lib/vehicle-routes';
import {pageContent} from '@/lib/page-content';
import { publishedRentalGuides } from '@/lib/rental-guides';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', '/flota/', '/tarifario/', '/maquinaria-y-transporte/', '/nosotros/', '/contacto/', '/como-funciona/', '/alquiler-para-empresas/', '/requisitos/', '/promociones/', '/alquiler-de-autos-glp/', ...fleetCategories.filter(category => fleet.some(vehicle => vehicle.categories.includes(category.name))).map(category => `/flota/${category.slug}/`), ...fleet.map(vehicle => `/flota/${vehicleSlug(vehicle.id)}/`), ...heavyServices.map(service => `/maquinaria-y-transporte/${service.id}/`)];
  if (publishedRentalGuides.length) paths.push('/guias/', ...publishedRentalGuides.map(guide => `/guias/${guide.slug}/`));
  return paths.map(path => {
    const updatedAt=pageContent(path)?.updatedAt??fleet.find(v=>path===`/flota/${vehicleSlug(v.id)}/`)?.updatedAt;
    return { url: `${business.siteUrl}${path}`, ...(updatedAt?{lastModified:updatedAt}:{}) };
  });
}
