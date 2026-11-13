import test from 'node:test';
import assert from 'node:assert/strict';
import {marketingAPI} from '../server/marketing-api.mjs';
import {contentRevision} from '../server/publication.mjs';
const origin='https://renting.example';
const env={SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'};
const req=(path,data={},extra={})=>new Request(origin+'/marketing-api/'+path+'/',{method:'POST',headers:{origin,cookie:'renting_auth=test',...extra},body:JSON.stringify(data)});

test('la versión publicada coincide con el contenido y cambia al editarlo',async()=>{
 const content={title:'Título',blocks:[{id:'one',body:'Texto'}]};
 assert.equal(await contentRevision(content),await contentRevision({blocks:[{body:'Texto',id:'one'}],title:'Título',covers:{}}));
 assert.notEqual(await contentRevision(content),await contentRevision({...content,title:'Nuevo título'}));
});
test('seguimiento exige sesión y solo consulta el marcador público de producción',async t=>{
 const request=cookie=>new Request(origin+'/marketing-api/publication-status/',{headers:{cookie}});
 assert.equal((await marketingAPI(request(''),env)).status,401);
 t.mock.method(globalThis,'fetch',async url=>{
  if(String(url).endsWith('/rpc/renting_admin'))return Response.json(true);
  assert.ok(String(url).startsWith('https://rentingcaraym.com/seo-publication.json?check='));
  return Response.json({revision:'a'.repeat(64),secret:'never return this'});
 });
 const result=await marketingAPI(request('renting_auth=test'),env);
 assert.deepEqual(await result.json(),{revision:'a'.repeat(64)});
});

test('SEO, tarifas y publicación requieren sesión y el mismo origen',async()=>{
 for(const path of ['page','block','publish','rates']){
  assert.equal((await marketingAPI(req(path,{}, {cookie:''}),env)).status,401);
  assert.equal((await marketingAPI(req(path,{}, {origin:'https://otro.example'}),env)).status,403);
 }
});
test('tarifas actualiza únicamente importes en céntimos de un vehículo',async t=>{
 let writes=0;
 t.mock.method(globalThis,'fetch',async(url,opts)=>{
  if(String(url).endsWith('/rpc/renting_admin'))return Response.json(true);
  assert.match(String(url), /\/vehiculos\?id=eq\.ford-territory$/);
  assert.equal(opts.method,'PATCH');
  assert.deepEqual(JSON.parse(opts.body),{
   tarifa_diaria_centimos:12000,
   tarifa_semanal_dia_centimos:null,
   tarifa_mensual_centimos:250000,
   garantia_centimos:0,
  });
  writes++;
  return Response.json([{id:'ford-territory'}]);
 });
 const rates={daily:12000,weeklyPerDay:null,monthly:250000,deposit:0};
 for(const daily of [0,120.5,-100,'12000',undefined]){
  assert.equal((await marketingAPI(req('rates',{id:'ford-territory',rates:{...rates,daily}}),env)).status,400);
 }
 assert.equal(writes,0);
 assert.equal((await marketingAPI(req('rates',{id:'ford-territory',rates,name:'No modificar'}),env)).status,200);
 assert.equal(writes,1);
});
test('textos rechazan enlaces ejecutables y campos vacíos; escritura limitada',async t=>{
 let writes=0;
 t.mock.method(globalThis,'fetch',async(url,opts)=>{
  if(String(url).endsWith('/rpc/renting_admin'))return Response.json(true);
  assert.equal(opts.method,'PATCH');
  assert.deepEqual(JSON.parse(opts.body),{titulo:'Garantía',cuerpo:'Consultar condiciones.',enlace_texto:'Consultar',enlace_url:'https://wa.me/51993334984'});
  writes++;return Response.json([{id:'rental-guarantee'}]);
 });
 const block={id:'rental-guarantee',title:'Garantía',body:'Consultar condiciones.',linkLabel:'Consultar',linkUrl:'https://wa.me/51993334984'};
 for(const linkUrl of ['javascript:alert(1)','//evil.example','data:text/html,test','https://example.com\\evil']){
  assert.equal((await marketingAPI(req('block',{...block,linkUrl}),env)).status,400);
 }
 assert.equal((await marketingAPI(req('block',{...block,body:'  '}),env)).status,400);
 assert.equal(writes,0);
 assert.equal((await marketingAPI(req('block',{...block,group:'Otro',id:'rental-guarantee'}),env)).status,200);
 assert.equal(writes,1);
});
test('una página inválida no llega a Postgres; guardar limita columnas',async t=>{
 let writes=0;
 t.mock.method(globalThis,'fetch',async(url,opts)=>{
  if(String(url).endsWith('/rpc/renting_admin'))return Response.json(true);
  writes++;assert.equal(opts.method,'PATCH');
  assert.deepEqual(JSON.parse(opts.body),{titulo:'Título',descripcion:'Descripción',encabezado:'Encabezado',introduccion:''});
  return Response.json([{ruta:'/flota/'}]);
 });
 const page={path:'/flota/',title:'Título',description:'Descripción',heading:'Encabezado',intro:''};
 assert.equal((await marketingAPI(req('page',{...page,title:''}),env)).status,400);
 assert.equal((await marketingAPI(req('page',{...page,path:'/../admin'}),env)).status,400);
 assert.equal(writes,0);
 assert.equal((await marketingAPI(req('page',{...page,extra:'no guardar'}),env)).status,200);
 assert.equal(writes,1);
});
test('publicar requiere POST y un hook configurado; no revela el secreto',async t=>{
 let deployments=0;
 t.mock.method(globalThis,'fetch',async(url,opts)=>{
  if(String(url).endsWith('/rpc/renting_admin'))return Response.json(true);
  if(String(url).includes('/rest/v1/'))return Response.json(String(url).includes('configuracion_web')?[{}]:[]);
  assert.equal(String(url),'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/test-secret');
  assert.equal(opts.method,'POST');deployments++;return Response.json({success:true});
 });
 assert.equal((await marketingAPI(new Request(origin+'/marketing-api/publish/',{headers:{cookie:'renting_auth=test'}}),env)).status,405);
 assert.equal((await marketingAPI(req('publish'),env)).status,503);
 assert.equal((await marketingAPI(req('publish'),{...env,CLOUDFLARE_DEPLOY_HOOK:'https://example.com/hook'})).status,503);
 const result=await marketingAPI(req('publish'),{...env,CLOUDFLARE_DEPLOY_HOOK:'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/test-secret'});
 assert.equal(result.status,200);assert.equal(deployments,1);assert.ok(!(await result.text()).includes('test-secret'));
});
