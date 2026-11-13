import { MarketingProvider } from '@/components/MarketingProvider';
import type { Metadata } from 'next';
import './globals.css';
import './gallery.css';
import './rental.css';
import './navigation.css';
import './tariff.css';
import brandLogo from '@/lib/img/RENTING-CAR.png';
import Header from '@/components/Header';
import { PromotionRibbon } from '@/components/Promotions';
import Analytics from '@/components/Analytics';
import Footer from '@/components/Footer';
import { business } from '@/lib/business';
import { publishedRentalGuides } from '@/lib/rental-guides';

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: { default: 'Renting Car A&M | Vehículos, maquinaria y transporte', template: '%s | Renting Car A&M' },
  description: 'Alquiler de vehículos, maquinaria y transporte de carga para personas y empresas. Solicite su cotización con Renting Car A&M.',
  icons: { icon: { url: brandLogo.src, type: 'image/png' } },
  openGraph: { siteName: 'Renting Car A&M', locale: 'es_PE', type: 'website', images: [{ url: '/brand/social.png', width: 1200, height: 630, alt: 'Renting Car A&M' }] },
};

const localBusiness = {
  '@context': 'https://schema.org', '@type': 'AutoRental', '@id': `${business.siteUrl}/#empresa`, name: 'Renting Car A&M',
  description: 'Alquiler de autos, camionetas y maquinaria pesada en Santiago de Surco, Lima.',
  image: `${business.siteUrl}/brand/social.png`, areaServed: {'@type':'City',name:'Lima'},
  url: business.siteUrl, telephone: business.phone, email: business.email,
  logo: `${business.siteUrl}/brand/logo.png`,
  address: { '@type': 'PostalAddress', streetAddress: 'Av. Santiago de Surco 3573', addressLocality: 'Santiago de Surco', addressRegion: 'Lima', postalCode: '15038', addressCountry: 'PE' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" data-scroll-behavior="smooth"><body><a className="skip" href="#contenido">Ir al contenido</a><MarketingProvider><PromotionRibbon/><Header showGuides={publishedRentalGuides.length > 0}/><main id="contenido" tabIndex={-1}>{children}</main><Footer/></MarketingProvider><Analytics/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness).replace(/</g, '\\u003c') }}/></body></html>;
}
