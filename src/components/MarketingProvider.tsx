'use client';
import {defaultBlocks} from '@/lib/content-blocks';
import {vehicleSlug} from '@/lib/vehicle-routes';
import initialPublic from '@/lib/marketing-public.json';
import {createContext,useContext,useEffect,useState} from 'react';
import {baseFleet,featuredFleet, vehicleFromListing, type Vehicle} from '@/lib/fleet';
import {business as defaults} from '@/lib/business';
import {home as defaultHome,type Marketing} from '@/lib/marketing';
import type {CatalogImage} from '@/lib/media';
import { promotionIsActive, type CommercialCatalog } from '@/lib/rental-pricing.mjs';
export type Snapshot=Marketing & {categories:string[];photos:CatalogImage[]};
const State=createContext<Snapshot|null>(null);
const CommercialState=createContext<CommercialCatalog|null>(null);
export function MarketingProvider({children}:{children:React.ReactNode}){
 const [data,set]=useState<Snapshot|null>(initialPublic as unknown as Snapshot);
 const [commercial,setCommercial]=useState<CommercialCatalog|null>(null);
 useEffect(()=>{let alive=true;async function read(){try{const r=await fetch('/marketing-api/public/',{cache:'no-store'});if(r.ok){const s=await r.json();if(alive)set(s);}}catch{/* Keep the last successful public view when offline. */}}
 void read();window.addEventListener('focus',read);window.addEventListener('marketing-saved',read);return()=>{alive=false;window.removeEventListener('focus',read);window.removeEventListener('marketing-saved',read);};},[]);
 useEffect(() => {
   let alive = true;
   let requested = 0;
   async function read() {
     const request = ++requested;
     try {
       const response = await fetch('/marketing-api/commercial/', { cache: 'no-store' });
       if (!response.ok) throw new Error('No se pudo consultar el tarifario');
       const catalog: CommercialCatalog = await response.json();
       if (alive && request === requested) setCommercial(catalog);
     } catch {
       if (alive && request === requested) setCommercial(current => current && ({
         ...current, promotions: current.promotions.filter(promotion => promotionIsActive(promotion)),
       }));
     }
   }
   void read();
   const timer = window.setInterval(() => { if (!document.hidden) void read(); }, 60000);
   window.addEventListener('focus', read);
   window.addEventListener('marketing-saved', read);
   return () => {
     alive = false;
     window.clearInterval(timer);
     window.removeEventListener('focus', read);
     window.removeEventListener('marketing-saved', read);
   };
 }, []);
 return <State.Provider value={data}><CommercialState.Provider value={commercial}>{children}</CommercialState.Provider></State.Provider>;
}
export function useCommercial() { return useContext(CommercialState); }
export function detailUrl(id:string){return baseFleet.some(v=>v.id===id)?'/flota/'+vehicleSlug(id)+'/':'/flota/ficha/?id='+encodeURIComponent(id);}
export function useMarketing(){
 const s=useContext(State);
 const fleet:Vehicle[]=s?.listings?.filter(v=>v.published!==false).map(v=>vehicleFromListing(v,s.photos))??baseFleet;
 const number=s?.whatsapp??defaults.whatsapp;
 const blocks=defaultBlocks.map(b=>s?.blocks?.find(current=>current.id===b.id)??b);
 return {blocks,block:(id:string)=>blocks.find(b=>b.id===id)!,pages:s?.pages??[],loaded:!!s,home:s??defaultHome,fleet,featuredFleet:s?fleet.filter(v=>s.listings?.some(l=>l.id===v.id&&l.featured)):featuredFleet,categories:['Todos',...(s?.categories??['SUV','Sedán','Familiar / 7 asientos'])],business:{...defaults,email:s?.email||defaults.email,adminEmail:s?.adminEmail||defaults.adminEmail,address:s?.address||defaults.address,groupUrl:s?.groupUrl||defaults.groupUrl,hours:s?.hours||defaults.hours,phone:s?.phone?.replace(/[^+0-9]/g,'')??defaults.phone,phoneLabel:s?.phone??defaults.phoneLabel,mapsUrl:s?.maps??defaults.mapsUrl,wazeUrl:s?.waze??defaults.wazeUrl},whatsappLabel:number===defaults.whatsapp?defaults.whatsappLabel:'+'+number,whatsappLink:(m:string)=>'https://wa.me/'+number+'?text='+encodeURIComponent(m)};
}
