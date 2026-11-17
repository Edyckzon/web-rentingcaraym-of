import assert from 'node:assert/strict';
import {test} from 'node:test';
import {marketingAPI} from '../server/marketing-api.mjs';
const origin='https://qa.example';
const env={SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'};
const photo='https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/'+ 'a'.repeat(64)+'.webp';
const pdf='https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-documentos/'+ 'b'.repeat(64)+'.pdf';
const request=(path,data,headers={})=>new Request(`${origin}/marketing-api/${path}`,{method:'POST',headers:{origin,cookie:'renting_auth=test',...headers},body:typeof data==='string'?data:JSON.stringify(data)});

test('fotos y PDF exigen administrador y el mismo origen',async()=>{
 for(const path of ['service-gallery','upload-document','requirements-document']){
  assert.equal((await marketingAPI(request(path,{}, {cookie:''}),env)).status,401);
  assert.equal((await marketingAPI(request(path,{}, {origin:'https://otro.example'}),env)).status,403);
 }
});
test('galería valida servicio, cantidad, duplicados, rutas y descripciones antes de guardar',async t=>{
 let writes=0;
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  if(String(url).endsWith('/rpc/renting_admin'))return Response.json(true);
  writes++;assert.ok(String(url).endsWith('/rpc/guardar_galeria_servicio'));
  assert.deepEqual(JSON.parse(options.body),{ficha:{id:'volquetes',images:[{src:photo,alt:'Volquete real'}]}});
  return new Response(null,{status:204});
 });
 const image={src:photo,alt:'Volquete real'};
 for(const data of [{id:'otro',images:[]},{id:'volquetes',images:[image,image]},{id:'volquetes',images:Array(41).fill(image)},{id:'volquetes',images:[{...image,src:'https://evil.example/a.jpg'}]},{id:'volquetes',images:[{...image,alt:''}]}]){
  assert.equal((await marketingAPI(request('service-gallery',data),env)).status,400);
 }
 assert.equal(writes,0);
 assert.equal((await marketingAPI(request('service-gallery',{id:'volquetes',images:[image]}),env)).status,200);
 assert.equal(writes,1);
});
test('PDF comprueba firma, lo sube como PDF y limita el enlace al bucket autorizado',async t=>{
 let uploads=0;const patches=[];
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  const path=String(url);
  if(path.endsWith('/rpc/renting_admin'))return Response.json(true);
  if(path.includes('/storage/v1/object/renting-documentos/')){uploads++;assert.equal(options.headers['Content-Type'],'application/pdf');return Response.json({});}
  patches.push(JSON.parse(options.body));return Response.json({});
 });
 assert.equal((await marketingAPI(request('upload-document','<html>invalid file</html>'),env)).status,400);
 const response=await marketingAPI(request('upload-document','%PDF-1.7\nQA document'),env);
 assert.equal(response.status,200);assert.match(await response.json(),/renting-documentos\/[a-f0-9]{64}\.pdf$/);
 assert.equal(uploads,1);
 assert.equal((await marketingAPI(request('requirements-document',{src:'https://evil.example/file.pdf'}),env)).status,400);
 assert.equal((await marketingAPI(request('requirements-document',{src:pdf}),env)).status,200);
 assert.equal((await marketingAPI(request('requirements-document',{src:null}),env)).status,200);
 assert.deepEqual(patches,[{requisitos_pdf:pdf},{requisitos_pdf:null}]);
});
