import type { Metadata } from 'next';
import './globals.css';
import brandLogo from '@/lib/img/RENTING-CAR.png';
export const metadata: Metadata = { title: 'RentingCar AyM | Tu viaje, a tu manera', description: 'Encuentra el vehículo para tu próxima ruta. Explora el catálogo de RentingCar AyM y prepara tu cotización de alquiler.', icons: { icon: { url: brandLogo.src, type: 'image/png' } } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
