import JsonLd from './JsonLd';
import { business } from '@/lib/business';

export default function BreadcrumbData({ trail }: { trail: { name: string; path: string }[] }) {
  const items = [{ name: 'Inicio', path: '/' }, ...trail];
  return <JsonLd data={{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: new URL(path, business.siteUrl).href,
    })),
  }}/>;
}
