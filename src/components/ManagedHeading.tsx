'use client';
import {useMarketing} from './MarketingProvider';
import {pageContent} from '@/lib/page-content';
export default function ManagedHeading({path,fallback}:{path:string;fallback:string}) {
 const {pages}=useMarketing();const page=pages.find(p=>p.path===path)??pageContent(path);
 return <><h1>{page?.heading??fallback}</h1><p className="lead">{page?.intro??''}</p></>;
}
