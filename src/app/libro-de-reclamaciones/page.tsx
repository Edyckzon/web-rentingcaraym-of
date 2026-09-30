import { PageIntro } from '@/components/Sections';
import { business } from '@/lib/business';
import { pageMetadata } from '@/lib/seo';
export const metadata = { ...pageMetadata('Libro de Reclamaciones', 'Información sobre el canal de atención de Renting Car A&M.', '/libro-de-reclamaciones/'), robots: { index: false, follow: true } };
export default function ComplaintsPage() {
  return <><PageIntro label="Atención al cliente" title="Libro de Reclamaciones" description="Información del canal de atención."/><article className="section container prose"><div className="detail-note"><h2>Registro virtual pendiente de habilitación</h2><p>El Libro de Reclamaciones virtual aún no está habilitado en esta web. Esta página no registra una reclamación ni emite una constancia.</p></div><p>Para consultar por el canal de registro disponible, contacte a Renting Car A&M en <a href={`mailto:${business.adminEmail}`}>{business.adminEmail}</a>, en la central <a href={`tel:${business.phone}`}>{business.phoneLabel}</a> o en {business.address}.</p><p>Una consulta por correo o teléfono no se presenta aquí como sustituto del Libro de Reclamaciones.</p></article></>;
}
