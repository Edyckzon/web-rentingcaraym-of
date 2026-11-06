'use client';
import SiteSignature from '@/components/SiteSignature';
import { useEffect, useState } from 'react';
import { business, whatsappNumber } from '@/lib/business';
import { home, type Marketing, type Listing } from '@/lib/marketing';
import { CarFront, PanelsTopLeft, Link2, Phone, ExternalLink, Star, Plus, ChevronLeft, LogOut, Images } from 'lucide-react';
import ActionDialog, {type EditorAction} from './ActionDialog';
import './editor.css';

const initial: Marketing = {...home, phone:business.phoneLabel, whatsapp:whatsappNumber, maps:business.mapsUrl, waze:business.wazeUrl, covers:home.covers || {}};
async function api(path:string,body?:BodyInit) {
  const r=await fetch('/marketing-api/'+path+'/',body===undefined?{cache:'no-store'}:{method:'POST',body});
  const result=await r.json();if(!r.ok)throw Error(result.error||'No se pudo guardar en Supabase.');
  return typeof result==='string'?result:JSON.stringify(result);
}
async function photo(file:File, max:number) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024)throw Error('Elige una foto JPG, PNG o WebP de hasta 15 MB.');
  const bitmap=await createImageBitmap(file);
  const ratio=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
  canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const blob=await new Promise<Blob>((ok,no)=>canvas.toBlob(b=>b?ok(b):no(Error('No se pudo preparar la foto.')),'image/webp',0.85));
  return api('upload',blob);
}

const sections=[['Vehículos',CarFront],['Portada',PanelsTopLeft],['Botones y enlaces',Link2],['Contacto',Phone],['Categorías',CarFront]] as const;
const blank=():Listing=>({id:'',name:'',category:'SUV',description:'',images:[],featured:false});
export default function Editor(){
  const [form,set]=useState(initial),[saved,remember]=useState(initial),[active,login]=useState(false),[key,setKey]=useState(''),[email,setEmail]=useState(''),[msg,status]=useState(''),[busy,wait]=useState(false);
  const [section,nav]=useState(0),[row,edit]=useState<Listing|null>(null),[query,search]=useState('');
  const [categoryNames,setCategories]=useState<string[]>([]),[selectedCat,chooseCat]=useState(''),[catName,nameCat]=useState('');
  const [action,ask]=useState<EditorAction|null>(null);
  const rows=saved.listings??[];
  const categoryUsage = new Map<string, number>();
  for (const vehicle of rows) categoryUsage.set(vehicle.category, (categoryUsage.get(vehicle.category) ?? 0) + 1);
  const assigned = categoryUsage.get(selectedCat) ?? 0;
  async function changeCategory(action:string){if(action==='delete' && assigned)throw Error('Reasigna los vehículos antes de eliminar esta categoría.');await api('category',JSON.stringify({action,old:selectedCat,name:catName}));await load();chooseCat('');nameCat('');window.dispatchEvent(new Event('marketing-saved'));status(action==='delete'?'Categoría eliminada.':action==='create'?'Categoría creada.':'Nombre actualizado.');}
  async function importPhotos(data:Marketing){
    const paths=[...new Set([data.hero,...(data.listings??[]).flatMap(v=>v.images)])].filter(p=>p.startsWith('/images/'));
    for(const [i,src] of paths.entries()){status('Importando foto '+(i+1)+' de '+paths.length+' a Supabase…');const image=await fetch(src);
      if(!image.ok)throw Error('No se pudo leer '+src);
      const r=await fetch('/marketing-api/import-photo/?src='+encodeURIComponent(src),{method:'POST',body:await image.blob()});
      if(!r.ok)throw Error((await r.json()).error||'Falló la importación. Vuelve a ingresar para reanudar.');
    }
    if(paths.length){await load();status('Importación completada en Supabase Storage.');}
  }
  const dirty=section===4?catName.trim()!==selectedCat:row?JSON.stringify(row)!==JSON.stringify(rows.find(v=>v.id===row.id)??blank()):JSON.stringify(form)!==JSON.stringify(saved);
  useEffect(()=>{if(!dirty)return;const leave=(e:BeforeUnloadEvent)=>{e.preventDefault();};window.addEventListener('beforeunload',leave);return()=>window.removeEventListener('beforeunload',leave);},[dirty]);
  async function load(){const next={...initial,...JSON.parse(await api('content'))};set(next);remember(next);setCategories(next.categories);login(true);return next;}
  useEffect(()=>{let mounted=true;api('content').then(async raw=>{if(!mounted)return;const next={...initial,...JSON.parse(raw)};set(next);remember(next);setCategories(next.categories);login(true);await run(()=>importPhotos(next));}).catch(()=>{});return()=>{mounted=false;};},[]);
  async function run(action:()=>Promise<void>){wait(true);status('');try{await action();}catch(e){status(e instanceof Error?e.message:'No se pudo guardar.');}finally{wait(false);}}
  async function save(next:Marketing){if(row){const item=next.listings?.find(v=>!rows.includes(v));if(item)await api('vehicle',JSON.stringify(item));else await api('remove',JSON.stringify({id:row.id}));}
    else {const keys=['title','accent','slogan','hero','firstLabel','firstUrl','secondLabel','secondUrl','phone','whatsapp','maps','waze'] as const;
    const changes=Object.fromEntries(keys.filter(k=>next[k]!==saved[k]).map(k=>[k,next[k]]));if(Object.keys(changes).length)await api('settings',JSON.stringify(changes));}
    await load();edit(null);window.dispatchEvent(new Event('marketing-saved'));status('Cambios guardados en Supabase.');}
  function leave(next:()=>void|Promise<void>){
    if(dirty)ask({title:'¿Descartar los cambios?',detail:'Los cambios que aún no guardaste se perderán.',label:'Descartar cambios',tone:'discard',apply:next});
    else void run(async()=>{await next();});
  }
  function go(n:number){leave(()=>{edit(null);set(saved);chooseCat('');nameCat('');nav(n);status('');});}
  function selectCategory(name:string){leave(()=>{chooseCat(name);nameCat(name);status('');});}
  function confirmSave(){
    if(row && (!row.name.trim()||!row.images.length)){status('Indica un nombre y agrega al menos una foto.');return;}
    const label=row?(row.id?'Guardar vehículo':'Crear vehículo'):'Guardar cambios';
    ask({title:row?(row.id?'¿Guardar los cambios en este vehículo?':'¿Crear este vehículo?'):'¿Guardar los cambios en '+sections[section][0]+'?',
      detail:row?('«'+row.name.trim()+'» · '+row.category+' · '+row.images.length+(row.images.length===1?' foto.':' fotos.')):'La web mostrará la nueva información de esta sección.',
      label,apply:row?saveVehicle:()=>save(form)});
  }
  function confirmCategory(mode:'create'|'rename'|'delete'){
    if(mode==='delete' && assigned)return;
    const name=catName.trim();
    ask(mode==='delete'?{title:'¿Eliminar la categoría?',detail:'«'+selectedCat+'» no tiene vehículos asociados. Se eliminará de la flota.',label:'Eliminar categoría',tone:'delete',apply:()=>changeCategory(mode)}:
      mode==='rename'?{title:'¿Cambiar el nombre de la categoría?',detail:'«'+selectedCat+'» pasará a llamarse «'+name+'». Los vehículos conservarán su categoría.',label:'Guardar nombre',apply:()=>changeCategory(mode)}:
      {title:'¿Crear la categoría?',detail:'«'+name+'» estará disponible al crear o editar vehículos.',label:'Crear categoría',apply:()=>changeCategory(mode)});
  }
  const field=(k:Exclude<keyof Marketing,'covers'|'listings'>,label:string,multi=false,limit=2048)=><label>{label}{multi?<textarea required maxLength={limit} value={form[k]} onChange={e=>set({...form,[k]:e.target.value})}/>:<input required maxLength={limit} value={form[k]} onChange={e=>set({...form,[k]:e.target.value})}/>}</label>;
  async function saveVehicle(){if(!row)return;
    if(!row.name.trim()||!row.images.length)throw Error('Indica el nombre y agrega al menos una foto.');
    const slug=row.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72)||'vehiculo';
    let id=row.id||slug;for(let i=2;!row.id&&rows.some(r=>r.id===id);i++)id=slug+'-'+i;
    const next={...row,id,name:row.name.trim()};await save({...saved,listings:row.id?rows.map(v=>v.id===id?next:v):[...rows,next]});
  }
  if(!active)return <div className="studio login"><form onSubmit={e=>{e.preventDefault();void run(async()=>{await api('login',JSON.stringify({email,password:key}));setKey('');await importPhotos(await load());});}}><small>RENTING CAR A&M / MARKETING</small><h1>Acceso al estudio</h1><p>Ingresa con tu cuenta de marketing.</p><label>Correo autorizado<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Contraseña<input required type="password" autoComplete="current-password" value={key} onChange={e=>setKey(e.target.value)}/></label><button disabled={busy} className="gold">Ingresar</button><p role="status">{msg}</p><SiteSignature admin/></form></div>;
  return <div className="studio shell">{action&&<ActionDialog action={action} dismiss={()=>ask(null)}/>}<aside><small>RENTING CAR A&M</small><h2>Estudio de marketing</h2><nav aria-label="Secciones de marketing">{sections.map(([label,Icon],i)=><button key={label} disabled={busy} aria-current={section===i?'page':undefined} onClick={()=>go(i)}><Icon size={18}/>{label}</button>)}</nav><a href="/" target="_blank" rel="noreferrer"><ExternalLink size={16}/> Ver sitio</a><button disabled={busy} onClick={()=>leave(async()=>{await api('logout','');edit(null);set(saved);chooseCat('');nameCat('');login(false);})}><LogOut size={16}/>Cerrar sesión</button></aside>
  <div className="workspace"><small>CONTENIDO WEB　/　MARKETING</small><header><div><h1>{section===0&&row?(row.id?'Editar vehículo':'Nuevo vehículo'):sections[section][0]}</h1><p>{['Gestiona las fichas, fotografías y destacados de la flota.','Actualiza la imagen y el mensaje principal del inicio.','Elige el texto y el destino de los botones de portada.','Actualiza los números y las indicaciones para llegar.','Gestiona las categorías que aparecen en la flota.'][section]}</p></div>{section===0&&!row&&<button className="gold" onClick={()=>{edit({...blank(),category:categoryNames[0]??''});status('');}}><Plus size={17}/> Nuevo vehículo</button>}</header>
  <p role="status" className="notice">{busy?(msg||'Procesando…'):msg}</p>
  {section===4?<fieldset disabled={busy}><section><h2>Categorías de la flota</h2><div className="category-list" aria-label="Categorías existentes">{categoryNames.map(n=><button type="button" key={n} aria-pressed={selectedCat===n} onClick={()=>selectCategory(n)}><strong>{n}</strong><span>{categoryUsage.get(n)??0} {categoryUsage.get(n)===1?'vehículo':'vehículos'}</span></button>)}</div><button type="button" onClick={()=>selectCategory('')}><Plus size={16}/> Nueva categoría</button><h3>{selectedCat?'Editar categoría':'Crear categoría'}</h3><label>Nombre<input maxLength={60} value={catName} onChange={e=>nameCat(e.target.value)}/></label><div className="actions"><button disabled={!catName.trim() || catName.trim()===selectedCat} className="gold" onClick={()=>confirmCategory(selectedCat?'rename':'create')}>{selectedCat?'Guardar nombre':'Crear categoría'}</button>{selectedCat&&<button disabled={assigned>0} aria-describedby="category-use" className="danger" onClick={()=>confirmCategory('delete')}>Eliminar categoría</button>}</div>{selectedCat&&<p id="category-use">{assigned?('No se puede eliminar: '+assigned+(assigned===1?' vehículo usa':' vehículos usan')+' esta categoría. Reasigna '+(assigned===1?'el vehículo':'los vehículos')+' primero.'):'Sin vehículos asociados. Puedes eliminar esta categoría.'}</p>}</section></fieldset>:section===0&&!row?<><div className="toolbar"><strong>Catálogo · {rows.length}</strong><input aria-label="Buscar vehículo" placeholder="Buscar por modelo…" value={query} onChange={e=>search(e.target.value)}/></div><div className="cards">{rows.filter(v=>v.name.toLowerCase().includes(query.toLowerCase())).map(v=><button className="model" key={v.id} onClick={()=>{edit(structuredClone(v));status('');}}><img src={v.images[0]} alt=""/><div><small>{v.category}{v.featured?' · DESTACADO':''}</small><h3>{v.name}</h3><span><Images size={15}/> {v.images.length} fotos　·　Editar ficha →</span></div></button>)}</div>{!rows.some(v=>v.name.toLowerCase().includes(query.toLowerCase()))&&<p>No hay vehículos que coincidan.</p>}</>:
  <form onSubmit={e=>{e.preventDefault();confirmSave();}}><fieldset disabled={busy}>
  {row?<><button type="button" onClick={()=>go(0)}><ChevronLeft size={16}/> Catálogo</button><section><h2>Ficha del vehículo</h2><div className="pair"><label>Marca y modelo<input required maxLength={100} value={row.name} onChange={e=>edit({...row,name:e.target.value})}/></label><label>Categoría<select value={row.category} onChange={e=>edit({...row,category:e.target.value as Listing['category']})}>{categoryNames.map(c=><option key={c}>{c}</option>)}</select></label></div><label>Descripción<textarea maxLength={1500} value={row.description} onChange={e=>edit({...row,description:e.target.value})}/></label><label className="check"><input type="checkbox" checked={row.featured} onChange={e=>edit({...row,featured:e.target.checked})}/> Destacar en el inicio</label></section>
  <section><h2>Galería de fotos</h2><p>La principal aparece en la tarjeta y abre la galería. Recomendado: 1600 × 1000 px.</p><label className="upload">Agregar fotografías<input multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const files=Array.from(e.target.files??[]);e.target.value='';void run(async()=>{if(files.length+row.images.length>40)throw Error('Máximo 40 fotos por vehículo.');const added=[];for(const f of files)added.push(await photo(f,1600));edit({...row,images:[...new Set([...row.images,...added])]});});}}/></label><div className="gallery">{row.images.map((src,i)=><article key={src}><img src={src} alt={'Foto '+(i+1)}/><div><button type="button" aria-pressed={!i} disabled={!i} onClick={()=>edit({...row,images:[src,...row.images.filter(x=>x!==src)]})}><Star size={14}/>{i?'Hacer principal':'Principal'}</button><button type="button" className="danger" aria-label={'Eliminar foto '+(i+1)} onClick={()=>ask({title:'¿Quitar esta foto?',detail:'Se retirará de la galería de «'+(row.name||'Nuevo vehículo')+'» cuando guardes la ficha.',label:'Quitar foto',tone:'delete',photo:src,apply:()=>{edit({...row,images:row.images.filter(x=>x!==src)});status(row.images.length===1?'Agrega una foto antes de guardar la ficha.':i===0?'La siguiente foto será la principal. Guarda para aplicar.':'Foto retirada. Guarda para aplicar.');}})}>Eliminar foto</button></div></article>)}</div></section></>:
  section===1?<section><h2>Imagen y mensaje</h2><img className="hero-thumb" src={form.hero} alt="Portada actual"/><label className="upload">Cambiar portada · 1920 × 800 px<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)void run(async()=>set({...form,hero:await photo(f,1920)}));}}/></label>{field('title','Título',true,140)}{field('accent','Texto destacado',false,100)}{field('slogan','Eslogan',true,240)}</section>:
  section===2?<>{([['firstLabel','firstUrl','Primer botón'],['secondLabel','secondUrl','Segundo botón']] as const).map(([label,url,title])=><section key={url}><h2>{title}</h2>{field(label,'Texto del botón',false,60)}{field(url,'Destino · ruta interna o https://')}</section>)}</>:<section><h2>Canales de contacto</h2>{field('whatsapp','WhatsApp con código de país')}{field('phone','Teléfono')}{field('maps','Google Maps')}{field('waze','Waze')}</section>}
  <div className="actions"><button className="gold">Guardar {row?'vehículo':'cambios'}</button>{row?.id&&<button type="button" className="danger" onClick={()=>ask({title:'¿Retirar este vehículo?',detail:'«'+row.name+'» dejará de aparecer en el catálogo y en su ficha pública.',label:'Retirar vehículo',tone:'delete',apply:()=>save({...saved,listings:rows.filter(v=>v.id!==row.id)})})}>Retirar vehículo</button>}</div></fieldset></form>}<SiteSignature admin/></div></div>;
}
