'use client';
import {FileDown} from 'lucide-react';
import {useMarketing} from './MarketingProvider';
export default function RequirementsDocument() {
  const {requirementsPdf}=useMarketing();
  if(!requirementsPdf)return null;
  return <section className="container requirements-document"><div><h2>Requisitos de alquiler en PDF</h2><p>Consulte o descargue el documento de Renting Car A&M.</p></div>
    <a className="button secondary" href={requirementsPdf} target="_blank" rel="noopener noreferrer"><FileDown size={20}/>Ver y descargar requisitos · PDF</a></section>;
}
