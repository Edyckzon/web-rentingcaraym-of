'use client';
import {useMarketing} from '@/components/MarketingProvider';
import {PageIntro} from '@/components/Sections';
import {ContentText,ContentLink} from '@/components/ContentText';

export default function ManagedLegalContent({prefix,label}:{prefix:'terms'|'privacy'|'complaints';label:string}) {
  const {block,blocks,business}=useMarketing();const header=block(prefix+'-header');
  return <><PageIntro label={label} title={header.title} description={header.body}/><article className="section container prose">
    <ContentLink block={header}/>
    {blocks.filter(b=>b.id.startsWith(prefix+'-')&&b.id!==header.id).map(item=><section key={item.id}><h2>{item.title}</h2><ContentText text={item.body}/><ContentLink block={item}/></section>)}
    <div className="detail-note"><h2>Canales de atención</h2><p><a href={`mailto:${prefix==='complaints'?business.adminEmail:business.email}`}>{prefix==='complaints'?business.adminEmail:business.email}</a><br/><a href={`tel:${business.phone}`}>{business.phoneLabel}</a><br/>{business.address}<br/>{business.hours}</p></div>
  </article></>;
}
