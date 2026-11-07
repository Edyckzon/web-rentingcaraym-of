'use client';
import {useEffect,useState} from 'react';
import type {WebPage} from '@/lib/page-content';

export default function PageEditor({pages,onSave,onDirtyChange}:{pages:WebPage[];onDirtyChange:(dirty:boolean)=>void;onSave:(page:WebPage)=>Promise<void>}) {
 const [path,setPath]=useState(pages[0]?.path??'/');
 const saved=pages.find(p=>p.path===path);
 const [draft,setDraft]=useState(saved);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const dirty=JSON.stringify(saved)!==JSON.stringify(draft);
 useEffect(()=>{onDirtyChange(dirty);},[dirty,onDirtyChange]);
 useEffect(()=>{setDraft(saved);},[saved]);
 useEffect(()=>{if(!dirty)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 if(!draft)return <p>No hay páginas disponibles. Comprueba la migración de SEO.</p>;
 return <form onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('Guardando…');try{await onSave(draft);setMessage('Página guardada. Publica el SEO para actualizar el HTML y los resultados al compartir.');}catch(err){setMessage(err instanceof Error?err.message:'No se pudo guardar.');}finally{setBusy(false);}}}>
  <fieldset disabled={busy}><label>Página<select disabled={dirty} value={path} onChange={e=>{setPath(e.target.value);setMessage('');}}>{pages.map(p=><option key={p.path} value={p.path}>{p.path}</option>)}</select></label>
  {dirty&&<p>Guarda o descarta los cambios antes de elegir otra página.</p>}
  <section><h2>Presentación en buscadores</h2><p>El nombre Renting Car A&M se añade automáticamente al título.</p>
  <label>Título SEO<input required maxLength={160} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
  <label>Descripción SEO<textarea required maxLength={320} value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})}/></label>
  <small>{draft.title.length+18} caracteres de título con marca · {draft.description.length} de descripción</small></section>
  <section><h2>Contenido de la página</h2><label>Encabezado principal (H1)<input required maxLength={200} value={draft.heading} onChange={e=>setDraft({...draft,heading:e.target.value})}/></label>
  <label>Introducción<textarea maxLength={1500} value={draft.intro} onChange={e=>setDraft({...draft,intro:e.target.value})}/></label></section>
  <div className="actions"><button className="gold" disabled={!dirty}>Guardar página</button><button type="button" disabled={!dirty} onClick={()=>setDraft(saved)}>Descartar cambios</button></div></fieldset><p role="status">{message}</p>
 </form>;
}
