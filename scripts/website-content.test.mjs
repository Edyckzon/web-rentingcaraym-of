import {test} from 'node:test';
import assert from 'node:assert/strict';
import {marketingAPI} from '../server/marketing-api.mjs';
import {validateServiceContent} from '../server/website-content.mjs';
import {saveCommercial} from '../server/commercial.mjs';
const origin='https://qa.example';const env={SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'};
const req=(path,input,cookie='renting_auth=test')=>new Request(`${origin}/marketing-api/${path}`,{method:'POST',headers:{origin,cookie},body:JSON.stringify(input)});
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const service={id:'transporte-de-carga',name:'Carga QA',equipment:'Equipo',description:'Descripción QA',message:'Cotizar carga',guidanceTitle:'Preparar propuesta',guidanceIntro:'Indique:',conditions:'Condiciones QA',applications:['Carga general'],quoteFields:['Origen','Destino']};
test('mantenimiento exige administrador y valida los textos antes de escribir',async t=>{
 assert.equal((await marketingAPI(req('service-content',service,''),env)).status,401);
 assert.equal((await marketingAPI(req('navigation',{},''),env)).status,401);
 let writes=0;t.mock.method(globalThis,'fetch',async(url,options)=>{
  if(String(url).endsWith('/rpc/renting_admin'))return Response.json(true);
  writes++;assert.deepEqual(JSON.parse(options.body),validateServiceContent(service,fail));return Response.json([{id:service.id}]);
 });
 for(const invalid of [{...service,id:'inventado'},{...service,description:''},{...service,applications:Array(21).fill('a')},{...service,quoteFields:['']}])assert.equal((await marketingAPI(req('service-content',invalid),env)).status,400);
 assert.equal(writes,0);assert.equal((await marketingAPI(req('service-content',service),env)).status,200);assert.equal(writes,1);
});
test('menú rechaza destinos ejecutables, ciclos y tipos inválidos',async t=>{
 let writes=0;t.mock.method(globalThis,'fetch',async(url,options)=>{
  if(String(url).endsWith('/rpc/renting_admin'))return Response.json(true);
  writes++;assert.ok(String(url).endsWith('/rpc/guardar_enlace_menu'));assert.equal(JSON.parse(options.body).ficha.destino,'/nosotros/');return Response.json({});
 });
 const item={id:'link-qa',parentId:'ayuda',label:'Empresa',href:'/nosotros/',position:20,visible:true};
 for(const href of ['javascript:alert(1)','//evil.test','https://evil.test\\a','data:text/html,','https://','https://user:pass@example.com'])assert.equal((await marketingAPI(req('navigation',{action:'save',item:{...item,href}}),env)).status,400);
 assert.equal((await marketingAPI(req('navigation',{action:'save',item:{...item,parentId:'link-qa'}}),env)).status,400);
 assert.equal(writes,0);assert.equal((await marketingAPI(req('navigation',{action:'save',item}),env)).status,200);assert.equal(writes,1);
});
test('los cinco servicios guardan ambos precios sin tocar la moneda ni el importe principal',async()=>{
 for(const id of ['empresas','maquinaria-y-transporte','excavadora-cat-330dl','volquetes','transporte-de-carga']){
  let payload;await saveCommercial('service-rate',{id,cents:90000,currency:'PEN',unit:'viaje',secondary:27500,secondaryMode:'manual'},async(path,options)=>{payload=JSON.parse(options.body);},fail);
  assert.deepEqual(payload,{precio_centimos:90000,unidad:'viaje',moneda:'PEN',alternativa_centimos:27500,alternativa_modo:'manual'});
 }
 await assert.rejects(saveCommercial('service-rate',{id:'transporte-de-carga',cents:90000,currency:'PEN',unit:'viaje',secondary:null,secondaryMode:'manual'},()=>{throw Error('No write expected');},fail),{status:400});
});
