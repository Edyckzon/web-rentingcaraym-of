import ManagedLegalContent from '@/components/ManagedLegalContent';
import {pageMetadata} from '@/lib/seo';
export const metadata = { ...pageMetadata('Información de privacidad', 'Información sobre los datos que comparte al solicitar una cotización con Renting Car A&M.', '/politica-de-privacidad/'), robots: { index: false, follow: true } };
export default function PrivacyPage() { return <ManagedLegalContent prefix="privacy" label="Información para sus consultas"/>; }
