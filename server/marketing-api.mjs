import {guardPassword} from './login-guard.mjs';
const project='https://pjkcihdiasktmwdpcmpt.supabase.co';
const bucket='/storage/v1/object/renting-fotos/', publicRoot=project+bucket.replace('/object/','/object/public/');
const fields={title:'titulo',accent:'destacado',slogan:'eslogan',hero:'portada',firstLabel:'boton_1',firstUrl:'destino_1',secondLabel:'boton_2',secondUrl:'destino_2',phone:'telefono',whatsapp:'whatsapp',maps:'maps',waze:'waze'};
const json=(v,status=200,headers={})=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
const fail=(s,m)=>{throw Object.assign(new Error(m),{status:s})};
const safeAsset=p=>typeof p==='string'&&(p.startsWith(publicRoot)||(/^\/images\/[\w%(). /-]+$/.test(p)&&!decodeURIComponent(p).split('/').includes('..')));
const safeLink=s=>typeof s==='string'&&!/[\\\s]/.test(s)&&(/^\/(?!\/)/.test(s)||/^https:\/\//.test(s));
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
   fail(r.status===401?401:r.status===403?403:r.status===409?409:r.status===429?429:400,error.code==='23503'?'La categoría se está usando. Reasigna sus vehículos antes de eliminarla.':error.code==='23505'?'Ese nombre ya existe.':error.code==='PGRST202'?'Ejecuta la migración 03 en Supabase.':r.status===401||path.startsWith('/auth/')?'Correo o contraseña incorrectos, o sesión vencida.':'Supabase rechazó la operación ('+(error.code||r.status)+').');}
   const t=await r.text();return t?JSON.parse(t):null;
 }
 const rest=(p,o,b)=>sup('/rest/v1/'+p,o,b),post=body=>({method:'POST',body:JSON.stringify(body)});
 async function snapshot(){
   const [settings,vehicles,photos,cats]=await Promise.all([rest('configuracion_web?id=eq.1',{},null),rest('vehiculos?select=*&order=id',{},null),rest('vehiculo_fotos?select=*&order=vehiculo_id,orden&limit=10000',{},null),rest('categorias?select=nombre&order=nombre',{},null).catch(e=>{if(!e.message.includes('PGRST205'))throw e;return null;})]);
   if(!settings[0])fail(503,'Falta la configuración web.');
   return {...Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,settings[0][v]])),categories:cats?.map(c=>c.nombre)??[...new Set(vehicles.map(v=>v.categoria))],listings:vehicles.map(v=>({id:v.id,name:v.nombre,category:v.categoria,description:v.descripcion,featured:v.destacado,images:photos.filter(p=>p.vehiculo_id===v.id).map(p=>p.ruta)})),photos:photos.map(p=>({src:p.ruta,alt:p.alt,credit:p.credito,reference:p.referencial,sourceUrl:p.fuente,license:p.licencia,licenseUrl:p.enlace_licencia}))};
 }
 if(req.method==='GET'&&path==='public')return json(await snapshot());
 if(path==='login'&&req.method==='POST'){
   const data=await req.json();const email=typeof data?.email==='string'?data.email.trim().toLowerCase():'';
   const password=data?.password;if(!email || email.length>254 || !email.includes('@') || typeof password!=='string'||!password||password.length>4096)fail(400,'Ingresa un correo y una contraseña válidos.');
   const verify=()=>sup('/auth/v1/token?grant_type=password',post({email,password}),null);
   // Staged rollout: enable when D1 is bound. Database errors never bypass the guard.
   const r=env.LOGIN_GUARD_DB?await guardPassword(env.LOGIN_GUARD_DB,email,verify):await verify();
   if(!r.user?.email_confirmed_at||!await rest('rpc/renting_admin',post({}),r.access_token))fail(403,'Esta cuenta no es administradora.');
   return json({},200,{'Set-Cookie':cookie(r.access_token,Math.min(3600,r.expires_in))});
 }
 if(path==='logout'&&req.method==='POST'){if(token)await sup('/auth/v1/logout?scope=local',{method:'POST'}).catch(()=>{});return json({},200,{'Set-Cookie':cookie('',0)});}
 if(!['content','vehicle','remove','settings','category','upload','import-photo'].includes(path))fail(404,'No encontrado.');
 if(!token||!await rest('rpc/renting_admin',post({})))fail(401,'Inicia sesión con una cuenta administradora.');
 if(path==='content'&&req.method==='GET')return json(await snapshot());
 if(req.method!=='POST')fail(405,'Método no permitido.');
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
 if(path==='vehicle'){
   if(!Array.isArray(data.images)||!data.images.every(safeAsset))fail(400,'Ruta de foto no válida.');
   await rest('rpc/guardar_vehiculo',post({ficha:data}));
 }else if(path==='remove'){await rest('vehiculos?id=eq.'+encodeURIComponent(data.id),{method:'DELETE'});}
 else if(path==='settings'){
   const entries=Object.entries(data);if(!entries.length||entries.some(([k,v])=>!Object.hasOwn(fields,k)||typeof v!=='string'||!v.trim()||v.length>2048||(['maps','waze','firstUrl','secondUrl'].includes(k)&&!safeLink(v))||(k==='hero'&&!safeAsset(v))||(k==='whatsapp'&&!/^\d{8,15}$/.test(v))))fail(400,'Revisa los campos y destinos.');
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
