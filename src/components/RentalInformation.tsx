'use client';
import { FileCheck2, CalendarDays, ShieldCheck, Wallet, ClipboardCheck } from 'lucide-react';
import {useMarketing} from '@/components/MarketingProvider';
import {ContentText,ContentLink} from '@/components/ContentText';

export default function RentalInformation() {
 const {whatsappLink,block}=useMarketing();const header=block('rental-header');
 const cards=[['requirements',FileCheck2],['duration',CalendarDays],['guarantee',ShieldCheck],['rates',Wallet],['coverage',ClipboardCheck]] as const;
 return <section className="section container" aria-labelledby="rental-info-title"><div className="section-heading"><div><p className="eyebrow">Antes de reservar</p><h2 id="rental-info-title">{header.title}</h2></div><div><ContentText text={header.body}/><ContentLink block={header}/></div></div>
  <div className="rental-info-grid">{cards.map(([id,Icon])=>{const item=block('rental-'+id);return <article key={id}><Icon size={28}/><h3>{item.title}</h3><ContentText text={item.body}/><ContentLink block={item} fallbackUrl={id==='guarantee'?whatsappLink('Hola, deseo conocer los requisitos y las condiciones de garantía para alquilar un vehículo.'):undefined}/></article>;})}</div>
 </section>;
}
