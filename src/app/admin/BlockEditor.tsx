'use client';
import {SaveToast} from './Feedback';
import {useEffect,useState} from 'react';
import type {ContentBlock} from '@/lib/content-blocks';
import {ContentLink,ContentText} from '@/components/ContentText';

export default function BlockEditor({blocks,onSave,onDirtyChange,onBusyChange}:{blocks:ContentBlock[];onSave:(block:ContentBlock)=>Promise<void>;onDirtyChange:(dirty:boolean)=>void;onBusyChange:(busy:boolean)=>void}) {
  const [id,setId]=useState(blocks[0]?.id??'');
  const saved=blocks.find(b=>b.id===id);
  const [draft,setDraft]=useState(saved),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const dirty=JSON.stringify(saved)!==JSON.stringify(draft);
  useEffect(()=>{setDraft(saved);},[saved]);
  useEffect(()=>{onDirtyChange(dirty);},[dirty,onDirtyChange]);
  if(!draft)return <p>No se pudieron cargar los textos. Recarga la página o revisa la conexión.</p>;
  return <form onSubmit={async e=>{e.preventDefault();setBusy(true);onBusyChange(true);setMessage('Guardando…');try{await onSave(draft);setMessage('Texto guardado. Ya aparece en la web; publica para actualizar también el HTML generado.');}catch(err){setMessage(err instanceof Error?err.message:'No se pudo guardar.');}finally{setBusy(false);onBusyChange(false);}}}>
    <fieldset disabled={busy}><label>Texto que deseas editar<select value={id} disabled={dirty} onChange={e=>{setId(e.target.value);setMessage('');}}>{[...new Set(blocks.map(b=>b.group))].map(group=><optgroup key={group} label={group}>{blocks.filter(b=>b.group===group).map(b=><option key={b.id} value={b.id}>{b.label}</option>)}</optgroup>)}</select></label>
    {dirty&&<p>Guarda o descarta los cambios para elegir otro texto.</p>}
    <section><h2>{draft.group} · {draft.label}</h2><p>Escribe información confirmada. Los saltos de línea se conservan; no se necesita HTML.</p>
    {['Reclamaciones','Privacidad','Condiciones'].includes(draft.group)&&<p>Publica información validada por la empresa. Editar esta página o añadir un enlace no crea un sistema de registro de reclamaciones.</p>}
    <label>Título<input required maxLength={200} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
    <label>Contenido<textarea required rows={9} maxLength={6000} value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value})}/></label>
    <div className="pair"><label>Texto del enlace (opcional)<input maxLength={100} value={draft.linkLabel} onChange={e=>setDraft({...draft,linkLabel:e.target.value})}/></label><label>Destino del enlace<input placeholder="/contacto/ o https://…" maxLength={2048} value={draft.linkUrl} onChange={e=>setDraft({...draft,linkUrl:e.target.value})}/></label></div>
    <p>Para retirar el enlace, borra su texto y destino. En las garantías, un texto de enlace sin destino usa el WhatsApp configurado.</p></section>
    <section><h2>Vista previa</h2><h3>{draft.title}</h3><ContentText text={draft.body}/><ContentLink block={draft}/></section>
    <div className="actions"><button className="gold" disabled={!dirty}>Guardar texto</button><button type="button" disabled={!dirty} onClick={()=>setDraft(saved)}>Descartar cambios</button></div></fieldset><SaveToast message={message} busy={busy}/>
  </form>;
}
