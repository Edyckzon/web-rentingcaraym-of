'use client';
import {useCommercial,useMarketing} from '@/components/MarketingProvider';
import { analyticsConfigured } from '@/lib/analytics';
import {PageIntro} from '@/components/Sections';
import {ContentText,ContentLink} from '@/components/ContentText';

export default function ManagedLegalContent({prefix,label}:{prefix:'terms'|'privacy'|'complaints';label:string}) {
  const {block,blocks,business}=useMarketing();const header=block(prefix+'-header');
  const hasRequestForm = Boolean(useCommercial()?.requestSiteKey);
  return <><PageIntro label={label} title={header.title} description={header.body}/><article className="section container prose">
    <ContentLink block={header}/>
    {blocks.filter(b=>b.id.startsWith(prefix+'-')&&b.id!==header.id).map(item=><section key={item.id}><h2>{item.title}</h2><ContentText text={item.id === 'privacy-02' && hasRequestForm ? item.body.replace('Esta web no envía el formulario a un servidor ni guarda sus datos en una base de datos.', 'Al preparar una consulta para WhatsApp, sus datos se usan para generar el mensaje en el navegador.') : item.body}/><ContentLink block={item}/></section>)}
    {prefix === 'privacy' && hasRequestForm && <section><h2>Solicitudes de llamada</h2><p>Al enviar una solicitud desde una ficha, guardamos los datos de contacto, los datos opcionales que ingresó y la cotización para que el equipo autorizado de A&M atienda su consulta. El formulario usa Cloudflare Turnstile para verificar el envío.</p></section>}
    {prefix === 'privacy' && analyticsConfigured && <section><h2>Cookies de analítica</h2><p>Si acepta la analítica, medimos páginas visitadas y acciones de cotización mediante Google Tag Manager y Google Analytics. Puede cambiar su elección con el botón Cookies.</p></section>}
    <div className="detail-note"><h2>Canales de atención</h2><p><a href={`mailto:${prefix==='complaints'?business.adminEmail:business.email}`}>{prefix==='complaints'?business.adminEmail:business.email}</a><br/><a href={`tel:${business.phone}`}>{business.phoneLabel}</a><br/>{business.address}<br/>{business.hours}</p></div>
  </article></>;
}
