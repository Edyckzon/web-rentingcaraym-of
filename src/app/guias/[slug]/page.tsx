import Link from 'next/link';
import { notFound } from 'next/navigation';
import BreadcrumbData from '@/components/BreadcrumbData';
import { PageIntro } from '@/components/Sections';
import { rentalGuides, visibleRentalGuides } from '@/lib/rental-guides';
import { pageMetadata } from '@/lib/seo';

type GuidePageProps = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return rentalGuides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = visibleRentalGuides().find(item => item.slug === slug);
  if (!guide) notFound();
  return {
    ...pageMetadata(guide.title, guide.description, `/guias/${slug}/`),
    ...(guide.published ? {} : { robots: { index: false } }),
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = visibleRentalGuides().find(item => item.slug === slug);
  if (!guide) notFound();
  return <>
    <BreadcrumbData trail={[{ name: 'Guías de alquiler', path: '/guias/' }, { name: guide.title, path: `/guias/${slug}/` }]}/>
    <PageIntro label={guide.published ? 'Guías de alquiler' : 'Guía en revisión'} title={guide.title} description={guide.description}/>
    <article className="section container prose">
      {guide.sections.map(section => <section key={section.title}>
        <h2>{section.title}</h2>
        <p>{section.body}</p>
      </section>)}
      <div className="button-row">
        {guide.links.map(link => <Link key={link.path} className="button accent" href={link.path}>{link.label}</Link>)}
        <Link className="button secondary" href="/guias/">Ver todas las guías</Link>
      </div>
    </article>
  </>;
}
