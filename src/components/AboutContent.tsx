'use client';
import ManagedIntro from './ManagedIntro';
import {useMarketing} from './MarketingProvider';
import {MapPin,Wrench} from 'lucide-react';
import {Closing,WhyUs} from './Sections';
import {ContentText,ContentLink} from './ContentText';
export default function AboutContent(){
 const {business,block}=useMarketing();const main=block('about-main'),workshop=block('about-workshop');
 return <><ManagedIntro path="/nosotros/" label="Nosotros"/><section className="section container about-grid"><div><h2>{main.title}</h2><ContentText text={main.body}/><ContentLink block={main}/></div>
 <div className="workshop-panel"><Wrench size={38} strokeWidth={1.5}/><h2>{workshop.title}</h2><ContentText text={workshop.body}/><address><MapPin size={20}/>{business.address}</address><ContentLink block={workshop} fallbackUrl={business.mapsUrl}/></div></section><WhyUs/><Closing/></>;
}
