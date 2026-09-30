import Link from 'next/link';
import { PageIntro } from '@/components/Sections';
export default function NotFound() {
  return <><PageIntro label="Página no encontrada" title="Busquemos otra ruta." description="La página que busca no está disponible. Puede explorar la flota o contactar a nuestro equipo."/><div className="section container button-row"><Link className="button accent" href="/flota/">Ver flota</Link><Link className="button secondary" href="/contacto/">Contacto</Link></div></>;
}
