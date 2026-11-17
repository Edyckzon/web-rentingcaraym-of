'use client';
import {useEffect,useMemo,useState} from 'react';
import {ArrowDown,ArrowUp,Images,Star} from 'lucide-react';
import {baseHeavyServices,type ServicePhoto} from '@/lib/services';
import ActionDialog,{type EditorAction} from './ActionDialog';
import {SaveToast} from './Feedback';
import ImageDownload from './ImageDownload';
import './service-photos.css';

type Props={photos:ServicePhoto[];api:(path:string,body?:BodyInit)=>Promise<string>;upload:(file:File,max:number)=>Promise<string>;onSaved:()=>Promise<void>;onDirtyChange:(dirty:boolean)=>void;onBusyChange:(busy:boolean)=>void};
export default function ServicePhotoEditor(props:Props) {
  const [id,setId]=useState(baseHeavyServices[0].id);
  const [dirty,setDirty]=useState(false);
  const [busy,setBusy]=useState(false);
  const saved=useMemo(()=>props.photos.filter(photo=>photo.serviceId===id),[props.photos,id]);
  useEffect(()=>props.onDirtyChange(dirty),[dirty,props.onDirtyChange]);
  const service=baseHeavyServices.find(item=>item.id===id)!;
  return <><div className="service-photo-tabs" role="group" aria-label="Servicios disponibles">{baseHeavyServices.map(item=><button key={item.id} type="button" disabled={dirty||busy} aria-pressed={id===item.id} onClick={()=>setId(item.id)}><Images size={20}/><strong>{item.name}</strong><span>{props.photos.filter(photo=>photo.serviceId===item.id).length} fotos</span></button>)}</div>
    <ServicePhotoForm key={`${id}:${JSON.stringify(saved)}`} {...props} id={id} name={service.name} saved={saved} reportDirty={setDirty} reportBusy={value=>{setBusy(value);props.onBusyChange(value);}}/>
  </>;
}
function ServicePhotoForm({id,name,saved,api,upload,onSaved,reportDirty,reportBusy}:Props & {id:string;name:string;saved:ServicePhoto[];reportDirty:(value:boolean)=>void;reportBusy:(value:boolean)=>void}) {
  const [draft,setDraft]=useState(saved);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [action,setAction]=useState<EditorAction>();
  const dirty=JSON.stringify(draft)!==JSON.stringify(saved);
  useEffect(()=>reportDirty(dirty),[dirty,reportDirty]);
  const move=(index:number,target:number)=>{const next=[...draft];const [photo]=next.splice(index,1);next.splice(target,0,photo);setDraft(next);};
  async function add(files:File[]) {
    if(!files.length)return;
    if(files.length+draft.length>40){setMessage('Máximo 40 fotos por servicio.');return;}
    setBusy(true);reportBusy(true);setMessage('');
    try {
      for(const file of files){const src=await upload(file,1600);setDraft(current=>current.some(photo=>photo.src===src)?current:[...current,{serviceId:id,src,alt:name}]);}
      setMessage('Fotos subidas. Guarda la galería para mostrarlas en la web.');
    } catch(error){setMessage(error instanceof Error?error.message:'No se pudieron subir las fotos.');}
    finally{setBusy(false);reportBusy(false);}
  }
  return <><SaveToast message={message} busy={busy}/>{action&&<ActionDialog action={action} dismiss={()=>setAction(undefined)}/>}
    <form onSubmit={event=>{event.preventDefault();setAction({title:`¿Guardar fotos de ${name}?`,detail:`Se publicarán ${draft.length} fotos. La primera se usará en la tarjeta del servicio.`,label:'Guardar galería',apply:async()=>{
      reportBusy(true);try{await api('service-gallery',JSON.stringify({id,images:draft}));await onSaved();window.dispatchEvent(new Event('marketing-saved'));}finally{reportBusy(false);}
    }});}}><fieldset disabled={busy}><section>
      <h2>Fotografías · {name}</h2><p>Recomendado: 1600 × 1000 px, formato horizontal. JPG, PNG o WebP hasta 15 MB por archivo. Máximo 40 fotos.</p>
      <p>La principal aparece en la tarjeta; todas se muestran en la ficha del servicio. Añade una descripción para cada foto.</p>
      <label className="upload">{busy?'Subiendo fotografías…':'Agregar fotografías'}<input multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>{const files=Array.from(event.target.files??[]);event.target.value='';void add(files);}}/></label>
      {!draft.length&&<p className="service-photo-empty">Todavía no hay fotos. Sube la primera para reemplazar «Fotografía pendiente».</p>}
      <div className="gallery service-photo-gallery">{draft.map((photo,index)=><article key={photo.src}>
        <img src={photo.src} alt={photo.alt}/><label>Descripción de foto {index+1}<input required maxLength={200} value={photo.alt} onChange={event=>setDraft(current=>current.map(item=>item.src===photo.src?{...item,alt:event.target.value}:item))}/></label>
        <div><button type="button" aria-pressed={index===0} disabled={index===0} onClick={()=>move(index,0)}><Star size={15}/>{index===0?'Principal':'Hacer principal'}</button>
          <button type="button" disabled={index===0} aria-label={`Subir foto ${index+1}`} onClick={()=>move(index,index-1)}><ArrowUp size={16}/></button>
          <button type="button" disabled={index===draft.length-1} aria-label={`Bajar foto ${index+1}`} onClick={()=>move(index,index+1)}><ArrowDown size={16}/></button>
          <button type="button" className="danger" aria-label={`Quitar foto ${index+1}`} onClick={()=>setAction({title:'¿Quitar esta foto?',detail:'Se retirará de la galería al guardar los cambios.',label:'Quitar foto',tone:'delete',photo:photo.src,apply:()=>setDraft(current=>current.filter(item=>item.src!==photo.src))})}>Quitar foto</button>
          <ImageDownload src={photo.src} name={`${id}-foto-${index+1}`} label="Descargar foto" onNotice={setMessage}/>
        </div></article>)}</div>
      <div className="actions"><button type="submit" className="gold" disabled={!dirty}>Guardar galería</button><button type="button" disabled={!dirty} onClick={()=>setAction({title:'¿Descartar cambios?',detail:'Se recuperará la galería guardada.',label:'Descartar cambios',tone:'discard',apply:()=>setDraft(saved)})}>Descartar cambios</button></div>
    </section></fieldset></form></>;
}
