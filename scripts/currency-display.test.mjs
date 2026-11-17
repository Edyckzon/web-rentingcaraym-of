import assert from 'node:assert/strict';
import {test} from 'node:test';
import {currencyEquivalent} from '../src/lib/currency-display.mjs';
import {saveCommercial} from '../server/commercial.mjs';
import {marketingAPI} from '../server/marketing-api.mjs';

const now=Date.parse('2026-11-17T15:00:00Z');
const settings={enabled:true,showRate:true,source:'bcrp',manualRate:null,manualDate:null};
const reference={available:true,date:'2026-11-16',sell:3.5};
test('convierte en ambas direcciones, redondea a céntimos y respeta apagado',()=>{
  assert.equal(currencyEquivalent(90000,'PEN',settings,reference,now).cents,25714);
  assert.equal(currencyEquivalent(10000,'USD',settings,reference,now).cents,35000);
  assert.equal(currencyEquivalent(90000,'PEN',{...settings,enabled:false},reference,now),null);
  assert.equal(currencyEquivalent(90000,'PEN',settings,{available:false},now),null);
  assert.equal(currencyEquivalent(90000,'PEN',settings,{...reference,date:'2026-11-01'},now),null);
  assert.equal(currencyEquivalent(90000,'PEN',settings,{...reference,date:'2026-11-18'},now),null);
  assert.equal(currencyEquivalent(90000,'PEN',settings,{...reference,sell:0},now),null);
});
test('TC manual tiene fecha y funciona sin BCRP',()=>{
  const manual={...settings,source:'manual',manualRate:3.6,manualDate:'2026-11-17'};
  const result=currencyEquivalent(90000,'PEN',manual,null,now);
  assert.equal(result.cents,25000);
  assert.equal(result.source,'TC manual');
  assert.equal(currencyEquivalent(90000,'PEN',{...manual,manualRate:null},null,now),null);
});
test('configuración valida TC manual y solo actualiza sus campos',async()=>{
  const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
  const calls=[];
  const rest=async(path,options)=>{calls.push([path,JSON.parse(options.body)]);};
  for(const manualRate of [0,-1,Infinity,3.12345,'3.5'])await assert.rejects(saveCommercial('rental-display',{...settings,source:'manual',manualRate,manualDate:'2026-11-17'},rest,fail),{status:400});
  assert.equal(calls.length,0);
  await saveCommercial('rental-display',settings,rest,fail);
  assert.deepEqual(calls,[['reglas_alquiler?id=eq.1',{mostrar_equivalencias:true,mostrar_tipo_cambio:true,fuente_cambio:'bcrp',cambio_manual:null,fecha_cambio_manual:null}]]);
});
test('segundo precio se guarda independiente; configuración exige administrador',async t=>{
  const origin='https://qa.example';const env={SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'};
  const request=(path,data,cookie='renting_auth=test')=>new Request(`${origin}/marketing-api/${path}`,{method:'POST',headers:{origin,cookie},body:JSON.stringify(data)});
  assert.equal((await marketingAPI(request('rental-display',settings,''),env)).status,401);
  let patch;
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    if(String(url).endsWith('rpc/renting_admin'))return Response.json(true);
    patch=JSON.parse(options.body);return Response.json([{id:'ford-territory'}]);
  });
  const rates={daily:90000,weeklyPerDay:null,monthly:null,deposit:null,currencies:{daily:'PEN',weeklyPerDay:'PEN',monthly:'PEN',deposit:'PEN'},secondary:{daily:27500,weeklyPerDay:null,monthly:null,deposit:null},secondaryMode:{daily:'manual',weeklyPerDay:'tc',monthly:'tc',deposit:'tc'}};
  assert.equal((await marketingAPI(request('rates',{id:'ford-territory',rates:{...rates,secondary:{...rates.secondary,daily:null}}}),env)).status,400);
  assert.equal(patch,undefined);
  assert.equal((await marketingAPI(request('rates',{id:'ford-territory',rates}),env)).status,200);
  assert.equal(patch.tarifa_diaria_centimos,90000);
  assert.equal(patch.tarifa_diaria_alternativa_centimos,27500);
  assert.equal(patch.tarifa_diaria_alternativa_modo,'manual');
});
