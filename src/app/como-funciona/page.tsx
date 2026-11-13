import ManagedIntro from '@/components/ManagedIntro';
import RentalInformation from '@/components/RentalInformation';
import { Closing, Faq, Steps } from '@/components/Sections';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('Cómo trabajamos', 'Conozca cómo solicitar una cotización y coordinar el alquiler de su vehículo o equipo con Renting Car A&M.', '/como-funciona/');
export default function ProcessPage() { return <><ManagedIntro path="/como-funciona/" label="Cómo trabajamos"/><Steps/><RentalInformation/><Faq structuredData/><Closing/></>; }
