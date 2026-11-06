import assert from 'node:assert/strict';
import test from 'node:test';
import {marketingAPI} from '../server/marketing-api.mjs';
const env={SUPABASE_PUBLISHABLE_KEY:'sb_publishable_mock'};
const origin='https://sitio.example';
function request(path,body,extra={}){return new Request(origin+'/marketing-api/'+path,{method:'POST',headers:{origin,...extra},body:JSON.stringify(body)});}
test('sin sesión no se puede editar; ni con sesión se acepta otro origen',async()=>{
 assert.equal((await marketingAPI(request('settings',{title:'otro'}),env)).status,401);
 assert.equal((await marketingAPI(request('vehicle',{},{origin:'https://otro.example',cookie:'renting_auth=token'}),env)).status,403);
 assert.equal((await marketingAPI(request('signup',{}),env)).status,404);
});
test('el login requiere rol en Supabase; el token no se devuelve en el cuerpo',async(t)=>{
 let admin=false;
 t.mock.method(globalThis,'fetch',async(url,opts)=>{
  if(url.includes('/token?'))return Response.json({access_token:'test-session',expires_in:3600,user:{email_confirmed_at:'ok'}});
  assert.ok(url.endsWith('/rpc/renting_admin'));assert.equal(opts.headers.Authorization,'Bearer test-session');return Response.json(admin);
 });
 const login=()=>marketingAPI(request('login',{email:'a@example.test',password:'test'}),env);
 assert.equal((await login()).status,403);admin=true;const r=await login();
 assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/HttpOnly; SameSite=Strict;.*Secure/);assert.deepEqual(await r.json(),{});
});
