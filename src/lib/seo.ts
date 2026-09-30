import type { Metadata } from 'next';

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title: { absolute: `${title} | Renting Car A&M` }, description, alternates: { canonical: path },
    openGraph: { title: `${title} | Renting Car A&M`, description, url: path, siteName: 'Renting Car A&M', locale: 'es_PE', type: 'website', images: [{ url: '/brand/social.png', width: 1200, height: 630, alt: 'Renting Car A&M' }] },
  };
}
