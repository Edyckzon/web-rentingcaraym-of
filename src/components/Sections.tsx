'use client';
import {useMarketing} from '@/components/MarketingProvider';
import Link from 'next/link';
import JsonLd from './JsonLd';
import {ContentText,ContentLink} from '@/components/ContentText';
import { ArrowUpRight, Building2, CarFront, ChevronDown, MapPin, MessageCircle, Wrench } from 'lucide-react';


export function PageIntro({ label, title, description }: { label: string; title: string; description: string }) {
  return <section className="page-intro"><div className="container"><p className="eyebrow">{label}</p><h1>{title}</h1><p className="lead">{description}</p></div></section>;
}

export function WhyUs() {
  const {block}=useMarketing();const header=block('why-header');const icons=[CarFront,Wrench,Building2,MapPin];
  return <section className="section container" id="nosotros"><div className="section-heading"><div><p className="eyebrow">Por qué A&M</p><h2>{header.title}</h2><ContentText text={header.body}/></div><ContentLink block={header}/></div>
    <div className="benefits-grid">{icons.map((Icon,i)=>{const item=block('why-0'+(i+1));return <article key={item.id}><Icon size={28} strokeWidth={1.5}/><h3>{item.title}</h3><ContentText text={item.body}/><ContentLink block={item}/></article>;})}</div>
  </section>;
}

export function Steps() {
  const {block}=useMarketing();const header=block('steps-header');
  return <section className="section soft" id="como-funciona"><div className="container"><div className="section-heading"><div><p className="eyebrow">Cómo trabajamos</p><h2>{header.title}</h2></div><div><ContentText text={header.body}/><ContentLink block={header}/></div></div><ol className="steps-grid">{[1,2,3,4].map(i=>{const item=block('step-0'+i);return <li key={item.id}><span className="step-number">0{i}</span><h3>{item.title}</h3><ContentText text={item.body}/><ContentLink block={item}/></li>;})}</ol></div></section>;
}

export function Faq({ structuredData = false }: { structuredData?: boolean }) {
  const { blocks, block } = useMarketing();
  const header = block('faq-header');
  const questions = blocks.filter(item => /^faq-\d+$/.test(item.id) && item.title.trim() && item.body.trim());
  return <section className="section dark-section" id="preguntas-frecuentes">
    {structuredData && questions.length > 0 && <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map(item => ({
        '@type': 'Question',
        name: item.title,
        acceptedAnswer: { '@type': 'Answer', text: item.body },
      })),
    }}/>}
    <div className="container faq-layout">
      <div><p className="eyebrow">Preguntas frecuentes</p><h2>{header.title}</h2><ContentText text={header.body}/><ContentLink block={header}/></div>
      <div className="faq">{questions.map(item => <details key={item.id}><summary>{item.title}<ChevronDown size={19}/></summary><ContentText text={item.body}/><ContentLink block={item}/></details>)}</div>
    </div>
  </section>;
}

export function Closing() {
  const {whatsappLink,block}=useMarketing();const item=block('closing');
  return <section className="closing"><div className="container closing-inner"><div><p className="eyebrow">Hablemos de su próximo proyecto</p><h2>{item.title}</h2><ContentText text={item.body}/></div><div className="button-row"><ContentLink block={item}/><a className="button secondary" href={whatsappLink('Hola, Renting Car A&M. Deseo una cotización.')} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>WhatsApp</a></div></div></section>;
}
