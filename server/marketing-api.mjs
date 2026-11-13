import { commercialCatalog, saveCommercial, saveFreightDraft } from './commercial.mjs';
import { validateAdminCredentials } from '../src/lib/admin-credentials.mjs';
import { receiveRentalRequest, requestSiteKey } from './rental-requests.mjs';
import {contentRevision} from './publication.mjs';
import {guardPassword} from './login-guard.mjs';
const project='https://pjkcihdiasktmwdpcmpt.supabase.co';
const bucket='/storage/v1/object/renting-fotos/', publicRoot=project+bucket.replace('/object/','/object/public/');
const fields={title:'titulo',accent:'destacado',slogan:'eslogan',hero:'portada',firstLabel:'boton_1',firstUrl:'destino_1',secondLabel:'boton_2',secondUrl:'destino_2',email:'email',adminEmail:'email_administracion',address:'direccion',groupUrl:'grupo_url',hours:'horario',phone:'telefono',whatsapp:'whatsapp',maps:'maps',waze:'waze'};
const json=(v,status=200,headers={})=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const fail=(s,m)=>{throw Object.assign(new Error(m),{status:s})};
const safeAsset=p=>typeof p==='string'&&(p.startsWith(publicRoot)||(/^\/images\/[\w%(). /-]+$/.test(p)&&!decodeURIComponent(p).split('/').includes('..')));
const safeLink=s=>typeof s==='string'&&!/[\\\s]/.test(s)&&(/^\/(?!\/)/.test(s)||/^https:\/\//.test(s));
const rateFields = {
  daily: 'tarifa_diaria_centimos',
  weeklyPerDay: 'tarifa_semanal_dia_centimos',
  monthly: 'tarifa_mensual_centimos',
  deposit: 'garantia_centimos',
};

function vehicleRates(vehicle) {
  const rates = Object.fromEntries(Object.entries(rateFields).map(([key, column]) => [key, vehicle[column] ?? null]));
  return Object.values(rates).some(value => value !== null) ? rates : undefined;
}
export async function marketingAPI(req,env){
 const u=new URL(req.url), path=u.pathname.replace(/^\/marketing-api\//,'').replace(/\/$/,'');
 const token=(req.headers.get('cookie')||'').match(/(?:^|;\s*)renting_auth=([\w.-]+)/)?.[1];
 const origin=req.headers.get('origin');const secure=u.protocol==='https:'?'; Secure':'';
 const cookie=(v,age)=>'renting_auth='+v+'; HttpOnly; SameSite=Strict; Path=/marketing-api; Max-Age='+age+secure;
 try{
 if(!env.SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_'))fail(503,'Falta configurar Supabase en el servidor.');
 if(req.method!=='GET' && (req.method!=='POST'||origin!==u.origin))fail(403,'Origen no permitido.');
 async function sup(path,options={},bearer=token){
   const r=await fetch(project+path,{...options,headers:{apikey:env.SUPABASE_PUBLISHABLE_KEY,...(bearer?{Authorization:'Bearer '+bearer}:{}),'Content-Type':'application/json',...options.headers}});
   if(!r.ok){const error=await r.json().catch(()=>({}));if(path.startsWith('/auth/v1/token') && (error.error_code??error.code)==='invalid_credentials')throw Object.assign(new Error('Correo o contraseña incorrectos.'),{status:401,authCode:'invalid_credentials'});
   if(error.code==='22023' && (path.startsWith('/rest/v1/promociones_alquiler')||path==='/rest/v1/rpc/guardar_promocion_categoria'))fail(400,error.message);
   fail(r.status===401?401:r.status===403?403:r.status===409?409:r.status===429?429:400,error.code==='23503'?'La categoría se está usando. Reasigna sus vehículos antes de eliminarla.':error.code==='23505'?'Ese nombre ya existe.':error.code==='PGRST202'?'Ejecuta la migración 03 en Supabase.':r.status===401||path.startsWith('/auth/')?'Correo o contraseña incorrectos, o sesión vencida.':'Supabase rechazó la operación ('+(error.code||r.status)+').');}
   const t=await r.text();return t?JSON.parse(t):null;
 }
 const rest=(p,o,b)=>sup('/rest/v1/'+p,o,b),post=body=>({method:'POST',body:JSON.stringify(body)});
 async function snapshot(includeDrafts = false) {
   const catalogToken = includeDrafts ? token : null;
   const [settings, vehicles, photos, categories, pages, blocks, links] = await Promise.all([
     rest('configuracion_web?id=eq.1', {}, null),
     rest('vehiculos?select=*&order=id', {}, catalogToken),
     rest('vehiculo_fotos?select=*&order=vehiculo_id,orden,id&limit=10000', {}, null),
     rest('categorias?select=nombre&order=nombre', {}, null).catch(e => {
       if (!e.message.includes('PGRST205')) throw e;
       return null;
     }),
     rest('paginas_web?select=*&order=ruta', {}, null),
     rest('bloques_web?select=*&order=orden', {}, null),
     rest('vehiculo_categorias?select=vehiculo_id,categoria&order=vehiculo_id,categoria', {}, catalogToken).catch(e => {
       if (!e.message.includes('PGRST205')) throw e;
       return [];
     }),
   ]);
   if (!settings[0]) fail(503, 'Falta la configuración web.');
   const visible = new Set(vehicles.map(v => v.id));
   return {
     blocks: blocks.map(b => ({ id:b.id, group:b.grupo, label:b.etiqueta, title:b.titulo, body:b.cuerpo, linkLabel:b.enlace_texto, linkUrl:b.enlace_url })),
     pages: pages.map(p => ({ path:p.ruta, title:p.titulo, description:p.descripcion, heading:p.encabezado, intro:p.introduccion, updatedAt:p.actualizado_en })),
     ...Object.fromEntries(Object.entries(fields).map(([k,v]) => [k, settings[0][v]])),
     categories: categories?.map(c => c.nombre) ?? [...new Set(vehicles.map(v => v.categoria))],
     listings: vehicles.map(v => ({
       id:v.id, name:v.nombre, category:v.categoria,
       additionalCategories: links.filter(link => link.vehiculo_id === v.id).map(link => link.categoria),
       profile: v.ficha_catalogo ?? undefined,
       published: v.catalogo_publicado ?? true,
       rates:vehicleRates(v), description:v.descripcion, seoTitle:v.seo_titulo, seoDescription:v.seo_descripcion,
       idealFor:v.ideal_para, updatedAt:v.actualizado_en, featured:v.destacado,
       images:photos.filter(p => p.vehiculo_id === v.id).map(p => p.ruta),
     })),
     photos: photos.filter(p => visible.has(p.vehiculo_id)).map(p => ({
       src:p.ruta, alt:p.alt, credit:p.credito, reference:p.referencial, sourceUrl:p.fuente, license:p.licencia, licenseUrl:p.enlace_licencia,
     })),
   };
 }
 if(req.method==='GET'&&path==='public')return json(await snapshot());
 if(req.method==='GET'&&path==='commercial')return json({ ...await commercialCatalog(rest), requestSiteKey: requestSiteKey(env) });
 if(req.method==='POST'&&path==='rental-request')return json(await receiveRentalRequest(req,env,{ rest, fail, vehicleRates, project }),201);
 if(path==='login'&&req.method==='POST'){
   const data = await req.json().catch(() => null);
   const { email, password, errors } = validateAdminCredentials(data?.email, data?.password);
   if (errors.email || errors.password) fail(400, 'Ingresa un correo y una contraseña válidos.');
   const verify=()=>sup('/auth/v1/token?grant_type=password',post({email,password}),null);
   // Staged rollout: enable when D1 is bound. Database errors never bypass the guard.
   const r=env.LOGIN_GUARD_DB?await guardPassword(env.LOGIN_GUARD_DB,email,verify):await verify();
   if(!r.user?.email_confirmed_at||!await rest('rpc/renting_admin',post({}),r.access_token))fail(403,'Esta cuenta no es administradora.');
   return json({},200,{'Set-Cookie':cookie(r.access_token,Math.min(3600,r.expires_in))});
 }
 if(path==='logout'&&req.method==='POST'){if(token)await sup('/auth/v1/logout?scope=local',{method:'POST'}).catch(()=>{});return json({},200,{'Set-Cookie':cookie('',0)});}
 if(!['content','vehicle','profile','rates','remove','settings','category','upload','import-photo','page','block','publish','publication-status','commercial-admin','rental-rules','rental-extra','rental-promotion','service-rate','rental-history','rental-inbox','freight-draft'].includes(path))fail(404,'No encontrado.');
 if(!token||!await rest('rpc/renting_admin',post({})))fail(401,'Inicia sesión con una cuenta administradora.');
 if(path==='content'&&req.method==='GET')return json(await snapshot(true));
 if(path==='commercial-admin'&&req.method==='GET')return json(await commercialCatalog(rest, token));
 if(path==='rental-history'&&req.method==='GET')return json(await rest('rpc/historial_tarifas_admin',post({})));
 if(path==='rental-inbox'&&req.method==='GET')return json(await rest('rpc/solicitudes_alquiler_admin',post({})));
 if(path==='freight-draft'&&req.method==='GET')return json(await rest('rutas_carga_borrador?order=origen,destino'));
 if(path==='publication-status'&&req.method==='GET'){
   const live=await fetch('https://rentingcaraym.com/seo-publication.json?check='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(8000)});
   if(!live.ok)return json({revision:null});
   const marker=await live.json().catch(()=>null);
   return json({revision:typeof marker?.revision==='string'&&/^[a-f0-9]{64}$/.test(marker.revision)?marker.revision:null});
 }
 if(req.method!=='POST')fail(405,'Método no permitido.');
 if(path==='publish'){
   if(!env.CLOUDFLARE_DEPLOY_HOOK)fail(503,'Este servidor no tiene CLOUDFLARE_DEPLOY_HOOK configurado. Si estás en local, la variable de Cloudflare no se copia a tu PC. Los datos siguen guardados en Supabase.');
   const hook=new URL(env.CLOUDFLARE_DEPLOY_HOOK);
   if(hook.origin!=='https://api.cloudflare.com'||!hook.pathname.startsWith('/client/v4/pages/webhooks/deploy_hooks/'))fail(503,'Deploy Hook no válido.');
   const revision=await contentRevision(await snapshot());
   const response=await fetch(hook,{method:'POST',signal:AbortSignal.timeout(15000)});
   if(!response.ok)fail(502,'Cloudflare no pudo iniciar la publicación. Inténtalo después.');
   return json({revision,message:'Publicación solicitada a Cloudflare. Espera a que termine la compilación antes de comprobar el SEO.'});
 }
 if(path==='upload'||path==='import-photo'){
   const bytes=await req.arrayBuffer();if(bytes.byteLength>5*1024*1024||bytes.byteLength<12)fail(400,'Tamaño de foto no válido.');
   const a=new Uint8Array(bytes),mime=a[0]===255&&a[1]===216?'image/jpeg':a[0]===137&&a[1]===80?'image/png':String.fromCharCode(...a.slice(0,4))==='RIFF'&&String.fromCharCode(...a.slice(8,12))==='WEBP'?'image/webp':'';
   if(!mime)fail(400,'Formato de foto no válido.');
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
   const name=hash+'.'+mime.split('/')[1], src=publicRoot+name;
   await sup(bucket+name,{method:'POST',body:bytes,headers:{'Content-Type':mime,'x-upsert':'true'}});
   if(path==='import-photo'){const anterior=u.searchParams.get('src');if(!anterior?.startsWith('/images/')||!safeAsset(anterior))fail(400,'Ruta de importación no válida.');await rest('rpc/migrar_foto',post({anterior,nueva:src}));}
   return json(src);
 }
 const data=await req.json();
 if(path==='freight-draft')return json(await saveFreightDraft(data,rest,fail));
 if(['rental-rules','rental-extra','rental-promotion','service-rate'].includes(path)){
   return json(await saveCommercial(path,data,rest,fail) ?? {});
 }else if(path==='block'){
   if(typeof data.id!=='string'||!/^[a-z0-9-]{1,100}$/.test(data.id))fail(400,'Texto no válido.');
   const keys={title:['titulo',200],body:['cuerpo',6000],linkLabel:['enlace_texto',100],linkUrl:['enlace_url',2048]};
   const patch={};
   for(const [key,[column,max]] of Object.entries(keys)){
     if(typeof data[key]!=='string'||data[key].length>max||(['title','body'].includes(key)&&!data[key].trim()))fail(400,'Revisa los textos; el título y el contenido no pueden quedar vacíos.');
     patch[column]=data[key].trim();
   }
   if(patch.enlace_url&&!safeLink(patch.enlace_url))fail(400,'Usa una ruta interna o un enlace https:// válido.');
   if(patch.enlace_url&&!patch.enlace_texto)fail(400,'Escribe el texto del enlace o elimina su destino.');
   const updated=await rest('bloques_web?id=eq.'+encodeURIComponent(data.id),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(patch)});
   if(!updated.length)fail(404,'Texto no encontrado.');
 }else if(path==='page'){
   const keys={title:['titulo',160],description:['descripcion',320],heading:['encabezado',200],intro:['introduccion',1500]};
   if(typeof data.path!=='string'||!/^\/([a-z0-9-]+\/)*$/.test(data.path))fail(400,'Ruta no válida.');
   const patch={};
   for(const [key,[column,max]] of Object.entries(keys)){
     if(typeof data[key]!=='string'||data[key].length>max||(key!=='intro'&&!data[key].trim()))fail(400,'Revisa los textos de la página.');
     patch[column]=data[key].trim();
   }
   const updated=await rest('paginas_web?ruta=eq.'+encodeURIComponent(data.path),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(patch)});
   if(!updated.length)fail(404,'Página no encontrada.');
 }else if(path==='profile'){
   if (typeof data?.id !== 'string' || !/^[a-z0-9-]{1,100}$/.test(data.id) || typeof data.published !== 'boolean') fail(400, 'Elija un vehículo y su estado.');
   if (!Array.isArray(data.categories) || data.categories.length > 12 || data.categories.some(c => typeof c !== 'string' || !c.trim() || c.length > 60)) fail(400, 'Revise las categorías.');
   const profile = {};
   for (const [key, min, max] of [['year',1900,2100], ['seats',1,100], ['includedKm',0,1000000]]) {
     const value = data.profile?.[key];
     if (value !== null && (!Number.isInteger(value) || value < min || value > max)) fail(400, 'Revise año, plazas y kilometraje.');
     profile[key] = value;
   }
   if (data.published && profile.year === null) fail(400, 'Indique el año confirmado antes de publicar.');
   for (const key of ['transmission','fuel','traction','engine','luggage']) {
     const value = data.profile?.[key];
     if (typeof value !== 'string' || value.length > 100) fail(400, 'Revise las especificaciones del vehículo.');
     profile[key] = value.trim();
   }
   await rest('rpc/guardar_ficha_catalogo', post({ ficha: { id:data.id, published:data.published, categories:data.categories, profile } }));
 }else if(path==='rates'){
   if(typeof data?.id!=='string'||!/^[a-z0-9-]{1,100}$/.test(data.id))fail(400,'Elija un vehículo válido.');
   const patch = {};
   for (const [key, column] of Object.entries(rateFields)) {
     const cents = data.rates?.[key];
     const minimum = key === 'deposit' ? 0 : 1;
     if (cents !== null && (!Number.isInteger(cents) || cents < minimum || cents > 100000000)) {
       fail(400,'Indique importes válidos en soles. Las tarifas deben ser mayores que cero.');
     }
     patch[column] = cents;
   }
   const updated = await rest('vehiculos?id=eq.' + encodeURIComponent(data.id), {
     method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(patch),
   });
   if (!updated.length) fail(404,'El vehículo ya no está disponible.');
 }else if(path==='vehicle'){
   if(!Array.isArray(data.images)||!data.images.every(safeAsset))fail(400,'Ruta de foto no válida.');
   if(typeof data.id!=='string'||!/^[a-z0-9-]{1,100}$/.test(data.id)||['ficha','suv','pickup-4x4','7-asientos','sedan'].includes(data.id))fail(400,'El identificador del vehículo coincide con una ruta reservada o no es válido.');
   await rest('rpc/guardar_vehiculo_catalogo',post({ficha:data}));
 }else if(path==='remove'){await rest('vehiculos?id=eq.'+encodeURIComponent(data.id),{method:'DELETE'});}
 else if(path==='settings'){
   const entries=Object.entries(data);if(!entries.length||entries.some(([k,v])=>!Object.hasOwn(fields,k)||typeof v!=='string'||!v.trim()||v.length>2048||(k==='hours'&&v.length>200)||(['maps','waze','firstUrl','secondUrl','groupUrl'].includes(k)&&!safeLink(v))||(['email','adminEmail'].includes(k)&&!/^[-a-zA-Z0-9.!#$%&'*+/=?^_`{|}~]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v))||(k==='hero'&&!safeAsset(v))||(k==='whatsapp'&&!/^\d{8,15}$/.test(v))))fail(400,'Revisa los campos y destinos.');
   await rest('configuracion_web?id=eq.1',{method:'PATCH',body:JSON.stringify(Object.fromEntries(entries.map(([k,v])=>[fields[k],v])))});
 }else if(path==='category'){
   const target='categorias?nombre=eq.'+encodeURIComponent(data.old??'');
   if(data.action==='create')await rest('categorias',post({nombre:data.name.trim()}));
   else if(data.action==='rename')await rest(target,{method:'PATCH',body:JSON.stringify({nombre:data.name.trim()})});
   else if(data.action==='delete')await rest(target,{method:'DELETE'});else fail(400,'Acción no válida.');
 }else fail(405,'Método no permitido.');
 return json({});
 }catch(e){return json({error:e.status?e.message:'No se pudo contactar con Supabase.'},e.status||502,e.retryAfter?{'Retry-After':String(e.retryAfter)}:{});}
}
