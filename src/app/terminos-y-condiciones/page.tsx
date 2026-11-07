import ManagedLegalContent from '@/components/ManagedLegalContent';
import {pageMetadata} from '@/lib/seo';
export const metadata = { ...pageMetadata('Condiciones de cotización', 'Información para consultar disponibilidad y condiciones del servicio con Renting Car A&M.', '/terminos-y-condiciones/'), robots: { index: false, follow: true } };
export default function TermsPage() { return <ManagedLegalContent prefix="terms" label="Antes de contratar"/>; }
