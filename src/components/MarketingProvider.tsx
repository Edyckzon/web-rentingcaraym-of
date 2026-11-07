'use client';
import {defaultBlocks} from '@/lib/content-blocks';
import {vehicleSlug} from '@/lib/vehicle-routes';
import initialPublic from '@/lib/marketing-public.json';
import {createContext,useContext,useEffect,useState} from 'react';
import {baseFleet,featuredFleet, type Vehicle} from '@/lib/fleet';
import {business as defaults} from '@/lib/business';
import {home as defaultHome,type Marketing} from '@/lib/marketing';
import type {CatalogImage} from '@/lib/media';
export type Snapshot=Marketing & {categories:string[];photos:CatalogImage[]};
const State=createContext<Snapshot|null>(null);
export function MarketingProvider({children}:{children:React.ReactNode}){
 const [data,set]=useState<Snapshot|null>(initialPublic as unknown as Snapshot);
 useEffect(()=>{let alive=true;async function read(){try{const r=await fetch('/marketing-api/public/',{cache:'no-store'});if(r.ok){const s=await r.json();if(alive)set(s);}}catch{/* Keep the last successful public view when offline. */}}
 void read();window.addEventListener('focus',read);window.addEventListener('marketing-saved',read);return()=>{alive=false;window.removeEventListener('focus',read);window.removeEventListener('marketing-saved',read);};},[]);
 return <State.Provider value={data}>{children}</State.Provider>;
}
export function detailUrl(id:string){return baseFleet.some(v=>v.id===id)?'/flota/'+vehicleSlug(id)+'/':'/flota/ficha/?id='+encodeURIComponent(id);}
export function useMarketing(){
 const s=useContext(State);
 const fleet:Vehicle[]=s?.listings?.map(v=>({...baseFleet.find(b=>b.id===v.id),id:v.id,name:v.name,category:v.category,description:v.description,seoTitle:v.seoTitle,seoDescription:v.seoDescription,idealFor:v.idealFor,updatedAt:v.updatedAt,images:v.images.map(src=>s.photos.find(p=>p.src===src)??{src,alt:v.name})}))??baseFleet;
 const number=s?.whatsapp??defaults.whatsapp;
 const blocks=defaultBlocks.map(b=>s?.blocks?.find(current=>current.id===b.id)??b);
 return {blocks,block:(id:string)=>blocks.find(b=>b.id===id)!,pages:s?.pages??[],loaded:!!s,home:s??defaultHome,fleet,featuredFleet:s?fleet.filter(v=>s.listings?.some(l=>l.id===v.id&&l.featured)):featuredFleet,categories:['Todos',...(s?.categories??['SUV','Sedán','Familiar / 7 asientos'])],business:{...defaults,email:s?.email||defaults.email,adminEmail:s?.adminEmail||defaults.adminEmail,address:s?.address||defaults.address,groupUrl:s?.groupUrl||defaults.groupUrl,hours:s?.hours||defaults.hours,phone:s?.phone?.replace(/[^+0-9]/g,'')??defaults.phone,phoneLabel:s?.phone??defaults.phoneLabel,mapsUrl:s?.maps??defaults.mapsUrl,wazeUrl:s?.waze??defaults.wazeUrl},whatsappLabel:number===defaults.whatsapp?defaults.whatsappLabel:'+'+number,whatsappLink:(m:string)=>'https://wa.me/'+number+'?text='+encodeURIComponent(m)};
}
