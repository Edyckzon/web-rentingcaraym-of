'use client';
import {useMarketing} from './MarketingProvider';
import {PageIntro} from './Sections';
import {pageContent} from '@/lib/page-content';
export default function ManagedIntro({path,label}:{path:string;label:string}) {
 const {pages}=useMarketing();const page=pages.find(p=>p.path===path)??pageContent(path);
 return <PageIntro label={label} title={page?.heading??label} description={page?.intro??''}/>;
}
