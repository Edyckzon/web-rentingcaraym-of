'use client';
import {useMarketing} from '@/components/MarketingProvider';
import { PageIntro } from '@/components/Sections';


export default function ComplaintContent(){
 const {business}=useMarketing();
  return <><PageIntro label="Atención al cliente" title="Libro de Reclamaciones" description="Información del canal de atención."/><article className="section container prose"><div className="detail-note"><h2>Registro virtual pendiente de habilitación</h2><p>El Libro de Reclamaciones virtual aún no está habilitado en esta web. Esta página no registra una reclamación ni emite una constancia.</p></div><p>Para consultar por el canal de registro disponible, contacte a Renting Car A&M en <a href={`mailto:${business.adminEmail}`}>{business.adminEmail}</a>, en la central <a href={`tel:${business.phone}`}>{business.phoneLabel}</a> o en {business.address}.</p><p>Una consulta por correo o teléfono no se presenta aquí como sustituto del Libro de Reclamaciones.</p></article></>;
}
