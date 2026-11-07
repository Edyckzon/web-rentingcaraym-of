import {pageContent} from './page-content';
import type { Metadata } from 'next';

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const page=pageContent(path);
  title=page?.title??title; description=page?.description??description;
  return {
    twitter: {card:'summary_large_image',title:`${title} | Renting Car A&M`,description,images:['/brand/social.png']},
    title: { absolute: `${title} | Renting Car A&M` }, description, alternates: { canonical: path },
    openGraph: { title: `${title} | Renting Car A&M`, description, url: path, siteName: 'Renting Car A&M', locale: 'es_PE', type: 'website', images: [{ url: '/brand/social.png', width: 1200, height: 630, alt: 'Renting Car A&M' }] },
  };
}
