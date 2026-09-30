import { Closing, Faq, PageIntro, Steps } from '@/components/Sections';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('Cómo trabajamos', 'Conozca cómo solicitar una cotización y coordinar el alquiler de su vehículo o equipo con Renting Car A&M.', '/como-funciona/');
export default function ProcessPage() { return <><PageIntro label="Cómo trabajamos" title="Coordinemos su próximo servicio." description="Elija su vehículo o equipo y conversemos sobre lo que necesita."/><Steps/><Faq/><Closing/></>; }
