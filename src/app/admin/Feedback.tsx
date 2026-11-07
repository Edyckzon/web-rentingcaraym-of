'use client';
import {useEffect,useState} from 'react';
import {CheckCircle2,LoaderCircle,X,Info} from 'lucide-react';

export function SaveToast({message,busy}:{message:string;busy:boolean}){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{if(!message||busy){setVisible(false);return;}setVisible(true);const timer=setTimeout(()=>setVisible(false),4000);return()=>clearTimeout(timer);},[message,busy]);
 if(!visible)return null;
 return <div className="admin-toast" role="status" aria-live="polite"><Info size={22} aria-hidden="true"/><p>{message}</p><button type="button" onClick={()=>setVisible(false)} aria-label="Cerrar aviso"><X size={18}/></button></div>;
}

export function PublicationToast({revision,onDone}:{revision:string;onDone:()=>void}){
 const [phase,setPhase]=useState<'waiting'|'success'|'pending'>('waiting');
 useEffect(()=>{
  let stopped=false;let timer:ReturnType<typeof setTimeout>;const deadline=Date.now()+8*60*1000;
  async function check(){
   try{
    const response=await fetch('/marketing-api/publication-status/',{cache:'no-store',signal:AbortSignal.timeout(12000)});
    if(response.status===401){if(!stopped)setPhase('pending');return;}
    const live=response.ok?await response.json():null;
    if(stopped)return;
    if(live?.revision===revision){setPhase('success');return;}
   }catch{/* A temporary network failure is not proof of a failed deployment. */}
   if(stopped)return;
   if(Date.now()>=deadline){setPhase('pending');return;}
   timer=setTimeout(check,10000);
  }
  void check();return()=>{stopped=true;clearTimeout(timer);};
 },[revision]);
 useEffect(()=>{if(phase==='waiting')return;const timer=setTimeout(onDone,4000);return()=>clearTimeout(timer);},[phase,onDone]);
 const Icon=phase==='waiting'?LoaderCircle:phase==='success'?CheckCircle2:Info;
 return <div className="admin-toast publication-toast" role="status" aria-live="polite"><Icon size={24} className={phase==='waiting'?'toast-spinner':''} aria-hidden="true"/><div><strong>{phase==='waiting'?'Publicación solicitada':phase==='success'?'Cambios confirmados en la web':'Publicación pendiente de confirmar'}</strong><p>{phase==='waiting'?'Comprobando la versión publicada. Mantén abierto el administrador.':phase==='success'?'La web publicada ya contiene estos textos y datos SEO.':'No pudimos confirmar esta versión. Revisa Implementaciones en Cloudflare; tus datos siguen guardados.'}</p></div><button type="button" onClick={onDone} aria-label="Cerrar seguimiento de publicación"><X size={18}/></button></div>;
}
