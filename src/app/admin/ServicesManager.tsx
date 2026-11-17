'use client';
import {useEffect,useState} from 'react';
import {baseServicePages,type ServiceContent,type ServicePhoto} from '@/lib/services';
import ServicePhotoEditor from './ServicePhotoEditor';
import ServiceRateEditor from './ServiceRateEditor';
import {SaveToast} from './Feedback';
import ActionDialog,{type EditorAction} from './ActionDialog';
type Props={content:ServiceContent[];photos:ServicePhoto[];api:(path:string,body?:BodyInit)=>Promise<string>;upload:(file:File,max:number)=>Promise<string>;onSaved:()=>Promise<void>;onDirtyChange:(dirty:boolean)=>void;onBusyChange:(busy:boolean)=>void};
export default function ServicesManager(props:Props){
 const [id,setId]=useState('empresas');const [tab,setTab]=useState('texts');const [dirty,setDirty]=useState(false);const [busy,setBusy]=useState(false);const [notice,setNotice]=useState('');
 useEffect(()=>props.onDirtyChange(dirty),[dirty,props.onDirtyChange]);
 const service=props.content.find(item=>item.id===id);
 return <><SaveToast message={notice} busy={false}/><div className="rate-admin-grid"><label>Servicio<select aria-label="Servicio" disabled={dirty||busy} value={id} onChange={event=>setId(event.target.value)}>{baseServicePages.map(item=><option value={item.id} key={item.id}>{props.content.find(row=>row.id===item.id)?.name??item.name}</option>)}</select></label></div>
 <div className="actions" role="group" aria-label="Mantenimiento del servicio">{[['texts','Descripción y condiciones'],['photos','Fotografías'],['prices','Precios PEN / USD']].map(([value,label])=><button type="button" key={value} disabled={busy||(dirty&&tab!==value)} aria-pressed={tab===value} onClick={()=>setTab(value)}>{label}</button>)}</div>
 {tab==='texts'&&(service?<ServiceForm key={id+JSON.stringify(service)} value={service} api={props.api} onDirtyChange={setDirty} onSaved={async()=>{await props.onSaved();setNotice('Contenido guardado.');}}/>:<p>Cargando contenido del servicio…</p>)}
 {tab==='photos'&&<ServicePhotoEditor key={id} {...props} fixedId={id} onBusyChange={value=>{setBusy(value);props.onBusyChange(value);}} onDirtyChange={setDirty}/>}
 {tab==='prices'&&<ServiceRateEditor key={id} id={id} api={props.api} onDirtyChange={setDirty}/>}</>;
}
function ServiceForm({value,api,onDirtyChange,onSaved}:{value:ServiceContent;api:Props['api'];onDirtyChange:Props['onDirtyChange'];onSaved:Props['onSaved']}){
 const [draft,setDraft]=useState(value);const [action,setAction]=useState<EditorAction>();
 const dirty=JSON.stringify(draft)!==JSON.stringify(value);useEffect(()=>onDirtyChange(dirty),[dirty,onDirtyChange]);
 const fields=[['name','Nombre de la tarjeta',100],['equipment','Equipo / subtítulo',100],['description','Descripción del servicio',4000],['guidanceTitle','Título de la orientación',200],['guidanceIntro','Introducción para cotizar',1500],['conditions','Condiciones del servicio',4000],['message','Mensaje de WhatsApp',2000]] as const;
 return <><form onSubmit={event=>{event.preventDefault();setAction({title:'¿Guardar contenido del servicio?',detail:draft.name,label:'Guardar contenido',apply:async()=>{await api('service-content',JSON.stringify({...draft,applications:draft.applications.map(line=>line.trim()).filter(Boolean),quoteFields:draft.quoteFields.map(line=>line.trim()).filter(Boolean)}));await onSaved();window.dispatchEvent(new Event('marketing-saved'));}});}}><section>
 <h2>Descripción y condiciones</h2><p>Los encabezados principales y los títulos para buscadores se gestionan en Páginas y SEO. Estos textos se muestran en la tarjeta y el cuerpo de la página del servicio.</p>
 {fields.map(([key,label,max])=><label key={key}>{label}{max>200?<textarea aria-label={label} required rows={4} maxLength={max} value={draft[key]??''} onChange={event=>setDraft({...draft,[key]:event.target.value})}/>:<input required maxLength={max} value={draft[key]??''} onChange={event=>setDraft({...draft,[key]:event.target.value})}/>}</label>)}
 {([['applications','Aplicaciones o usos'],['quoteFields','Datos que debe proporcionar el cliente']] as const).map(([key,label])=><label key={key}>{label} · una línea por elemento<textarea aria-label={label} rows={5} value={draft[key].join('\n')} onChange={event=>setDraft({...draft,[key]:event.target.value.split('\n')})}/></label>)}
 <div className="actions"><button className="gold" disabled={!dirty}>Guardar contenido</button><button type="button" disabled={!dirty} onClick={()=>setDraft(value)}>Descartar cambios</button></div>
 </section></form>{action&&<ActionDialog action={action} dismiss={()=>setAction(undefined)}/>}</>;
}
