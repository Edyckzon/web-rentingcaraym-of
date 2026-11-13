import Link from 'next/link';
import { notFound } from 'next/navigation';
import BreadcrumbData from '@/components/BreadcrumbData';
import { PageIntro } from '@/components/Sections';
import { publishedRentalGuides, visibleRentalGuides } from '@/lib/rental-guides';
import { pageMetadata } from '@/lib/seo';

const path = '/guias/';
const title = 'Guías de alquiler';
const description = 'Prepare su alquiler con información sobre requisitos, combustible y elección de vehículo.';
export const metadata = {
  ...pageMetadata(title, description, path),
  ...(publishedRentalGuides.length ? {} : { robots: { index: false } }),
};

export default function GuidesPage() {
  const guides = visibleRentalGuides();
  if (!guides.length) notFound();
  return <>
    <BreadcrumbData trail={[{ name: title, path }]}/>
    <PageIntro label="Renting Car A&M" title={title} description={description}/>
    <section className="section container prose">
      <ul>{guides.map(guide => <li key={guide.slug}>
        <Link className="text-link" href={`/guias/${guide.slug}/`}>{guide.title}</Link>
        <p>{guide.description}</p>
      </li>)}</ul>
    </section>
  </>;
}
