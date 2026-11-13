'use client';
import {useMarketing} from './MarketingProvider';
import {PageIntro} from './Sections';
import BreadcrumbData from './BreadcrumbData';
import {pageContent} from '@/lib/page-content';
export default function ManagedIntro({path,label}:{path:string;label:string}) {
 const {pages}=useMarketing();const page=pages.find(p=>p.path===path)??pageContent(path);
 const title = page?.heading ?? label;
 return <><BreadcrumbData trail={[{ name: title, path }]}/><PageIntro label={label} title={title} description={page?.intro??''}/></>;
}
