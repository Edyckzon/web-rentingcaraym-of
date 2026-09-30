import Link from 'next/link';
import { PageIntro } from '@/components/Sections';
export const metadata = { title: 'Su solicitud', robots: { index: false, follow: true } };
export default function ThanksPage() {
  return <><PageIntro label="Su cotización" title="Continúe su consulta por WhatsApp." description="Si preparó un mensaje, complete el envío dentro de WhatsApp para que nuestro equipo lo reciba."/><section className="section container prose"><p>Esta página no confirma la recepción de una solicitud ni una reserva. Puede volver al formulario para preparar su consulta.</p><Link className="button accent" href="/contacto/#cotizacion">Ir al formulario</Link></section></>;
}
