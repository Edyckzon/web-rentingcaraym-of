import type { MetadataRoute } from 'next';
import { business } from '@/lib/business';
import { fleet } from '@/lib/fleet';
import { heavyServices } from '@/lib/services';
import {vehicleSlug} from '@/lib/vehicle-routes';
import {pageContent} from '@/lib/page-content';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', '/flota/', '/maquinaria-y-transporte/', '/nosotros/', '/contacto/', '/como-funciona/', '/alquiler-para-empresas/', ...fleet.map(vehicle => `/flota/${vehicleSlug(vehicle.id)}/`), ...heavyServices.map(service => `/maquinaria-y-transporte/${service.id}/`)];
  return paths.map(path => {
    const updatedAt=pageContent(path)?.updatedAt??fleet.find(v=>path===`/flota/${vehicleSlug(v.id)}/`)?.updatedAt;
    return { url: `${business.siteUrl}${path}`, ...(updatedAt?{lastModified:updatedAt}:{}) };
  });
}
