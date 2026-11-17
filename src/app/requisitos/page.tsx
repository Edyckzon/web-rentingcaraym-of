import ManagedIntro from '@/components/ManagedIntro';
import { Closing, PageIntro } from '@/components/Sections';
import RequirementsDocument from '@/components/RequirementsDocument';
import RentalInformation from '@/components/RentalInformation';
import BreadcrumbData from '@/components/BreadcrumbData';
import { pageMetadata } from '@/lib/seo';

const title = 'Requisitos para alquilar un auto en Lima';
const description = 'Revise documentación, garantía, coberturas y condiciones antes de alquilar un vehículo con Renting Car A&M.';
const path = '/requisitos/';
export const metadata = pageMetadata(title, description, path);

export default function RequirementsPage() {
  return <><BreadcrumbData trail={[{ name: 'Requisitos de alquiler', path }]}/>
    <ManagedIntro path={path} label="Alquiler de vehículos"/><RequirementsDocument/><RentalInformation/><Closing/></>;
}
