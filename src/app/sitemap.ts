import type { MetadataRoute } from 'next';
import { business } from '@/lib/business';
import { fleet } from '@/lib/fleet';
import { heavyServices } from '@/lib/services';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', '/flota/', '/maquinaria-y-transporte/', '/nosotros/', '/contacto/', '/como-funciona/', ...fleet.map(vehicle => `/flota/${vehicle.id}/`), ...heavyServices.map(service => `/maquinaria-y-transporte/${service.id}/`)];
  return paths.map(path => ({ url: `${business.siteUrl}${path}` }));
}
