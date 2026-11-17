'use client';
import {useEffect,useState} from 'react';
import type {ContentBlock} from '@/lib/content-blocks';
import ActionDialog,{type EditorAction} from './ActionDialog';
import BlockEditor from './BlockEditor';
import {SaveToast} from './Feedback';
import './service-photos.css';

export default function RequirementsEditor({blocks,src,api,onSaved,onSaveText,onDirtyChange,onBusyChange}:{blocks:ContentBlock[];src?:string|null;api:(path:string,body?:BodyInit)=>Promise<string>;onSaved:()=>Promise<void>;onSaveText:(block:ContentBlock)=>Promise<void>;onDirtyChange:(dirty:boolean)=>void;onBusyChange:(busy:boolean)=>void}) {
  const [file,setFile]=useState<File>();
  const [textDirty,setTextDirty]=useState(false);
  const [action,setAction]=useState<EditorAction>();
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>onDirtyChange(Boolean(file)||textDirty),[file,textDirty,onDirtyChange]);
  async function save(remove=false){setBusy(true);onBusyChange(true);try{
    const document=remove?null:await api('upload-document',file);
    await api('requirements-document',JSON.stringify({src:document}));setFile(undefined);await onSaved();window.dispatchEvent(new Event('marketing-saved'));setMessage(remove?'PDF retirado de la web.':'PDF de requisitos guardado.');
  }finally{setBusy(false);onBusyChange(false);}}
  return <><p>Esta información se publica en <a href="/requisitos/" target="_blank" rel="noopener noreferrer">Ayuda → Requisitos de alquiler</a>. El texto y el PDF se gestionan por separado.</p>
    <section className="requirements-pdf"><h2>Documento de requisitos · PDF</h2>{src?<p><a href={src} target="_blank" rel="noopener noreferrer">Abrir PDF publicado</a></p>:<p>Aún no hay un PDF publicado. El texto de requisitos sigue disponible en la página.</p>}
      <fieldset disabled={busy}><label>Subir o reemplazar PDF · máximo 5 MB<input type="file" accept="application/pdf,.pdf" onChange={event=>{const selected=event.target.files?.[0];event.target.value='';if(!selected)return;if(!selected.name.toLowerCase().endsWith('.pdf')||selected.size>5*1024*1024){setMessage('Elige un archivo PDF de hasta 5 MB.');return;}setFile(selected);setMessage('');}}/></label>
      {file&&<p>Archivo seleccionado: {file.name}</p>}<div className="actions"><button type="button" className="gold" disabled={!file} onClick={()=>setAction({title:'¿Publicar PDF de requisitos?',detail:`Se publicará «${file?.name}» en la página de requisitos.`,label:'Publicar PDF',apply:()=>save()})}>Publicar PDF</button>
      {file&&<button type="button" onClick={()=>setFile(undefined)}>Descartar archivo</button>}{src&&<button type="button" className="danger" onClick={()=>setAction({title:'¿Quitar PDF de requisitos?',detail:'El enlace al documento se retirará. El texto de la página se conservará.',label:'Quitar PDF',tone:'delete',apply:()=>save(true)})}>Quitar PDF</button>}</div></fieldset>
    </section>
    <BlockEditor blocks={blocks.filter(block=>block.group==='Alquiler')} initialId="rental-requirements" onSave={onSaveText} onDirtyChange={setTextDirty} onBusyChange={onBusyChange}/>
    {action&&<ActionDialog action={action} dismiss={()=>setAction(undefined)}/>}<SaveToast message={message} busy={busy}/>
  </>;
}
