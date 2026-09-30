import type { Metadata } from 'next';
import './globals.css';
import brandLogo from '@/lib/img/RENTING-CAR.png';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { business } from '@/lib/business';

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: { default: 'Renting Car A&M | Vehículos, maquinaria y transporte', template: '%s | Renting Car A&M' },
  description: 'Alquiler de vehículos, maquinaria y transporte de carga para personas y empresas. Solicite su cotización con Renting Car A&M.',
  icons: { icon: { url: brandLogo.src, type: 'image/png' } },
  openGraph: { siteName: 'Renting Car A&M', locale: 'es_PE', type: 'website', images: [{ url: '/brand/social.png', width: 1200, height: 630, alt: 'Renting Car A&M' }] },
};

const localBusiness = {
  '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'Renting Car A&M',
  url: business.siteUrl, telephone: business.phone, email: business.email,
  logo: `${business.siteUrl}/brand/logo.png`,
  address: { '@type': 'PostalAddress', streetAddress: 'Av. Santiago de Surco 3573', addressLocality: 'Santiago de Surco', addressRegion: 'Lima', postalCode: '15038', addressCountry: 'PE' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><a className="skip" href="#contenido">Ir al contenido</a><Header/><main id="contenido" tabIndex={-1}>{children}</main><Footer/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness).replace(/</g, '\\u003c') }}/></body></html>;
}
