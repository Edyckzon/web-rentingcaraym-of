'use client';
import {useMarketing} from './MarketingProvider';
export default function ServiceWhatsApp({message,children}:{message:string;children:React.ReactNode}){
 const {whatsappLink}=useMarketing();
 return <a className="button secondary" href={whatsappLink(message)} target="_blank" rel="noopener noreferrer">{children}</a>;
}
