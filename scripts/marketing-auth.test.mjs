import {localLoginDb} from './local-login-db.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {marketingAPI} from '../server/marketing-api.mjs';
const env={SUPABASE_PUBLISHABLE_KEY:'sb_publishable_mock',LOGIN_GUARD_DB:localLoginDb()};
const origin='https://sitio.example';
function request(path,body,extra={}){return new Request(origin+'/marketing-api/'+path,{method:'POST',headers:{origin,...extra},body:JSON.stringify(body)});}
test('sin sesión no se puede editar; ni con sesión se acepta otro origen',async()=>{
 assert.equal((await marketingAPI(request('settings',{title:'otro'}),env)).status,401);
 assert.equal((await marketingAPI(request('vehicle',{},{origin:'https://otro.example',cookie:'renting_auth=token'}),env)).status,403);
 assert.equal((await marketingAPI(request('signup',{}),env)).status,404);
});
test('el login rechaza correos mal formados y campos vacíos antes de consultar Supabase',async t=>{
 const fetchMock=t.mock.method(globalThis,'fetch',async()=>{throw new Error('No debe consultar Supabase');});
 for(const body of [{email:'a@@example.test',password:'test'},{email:'a @example.test',password:'test'},
  {email:'a@example.test',password:''},{email:['a@example.test'],password:'test'}]){
  assert.equal((await marketingAPI(request('login',body),env)).status,400);
 }
 const invalidJson = new Request(origin+'/marketing-api/login',{method:'POST',headers:{origin},body:'{'});
 assert.equal((await marketingAPI(invalidJson,env)).status,400);
 assert.equal(fetchMock.mock.callCount(),0);
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
test('séptimo fallo bloquea el correo durante 15 minutos; otro correo sigue funcionando',async(t)=>{
 const db=localLoginDb(),local={...env,LOGIN_GUARD_DB:db};
 let calls=0,ok=false;
 t.mock.method(globalThis,'fetch',async(url)=>{
   if(!url.includes('/token?'))return Response.json(true);
   calls++;
   return ok?Response.json({access_token:'ok',expires_in:3600,user:{email_confirmed_at:'ok'}}):Response.json({error_code:'invalid_credentials'},{status:400});
 });
 const login=(email='ADMIN@example.test')=>marketingAPI(request('login',{email,password:'example'}),local);
 for(let n=0;n<6;n++)assert.equal((await login()).status,401);
 const seventh=await login(' admin@example.test ');assert.equal(seventh.status,429);assert.equal(seventh.headers.get('Retry-After'),'900');
 ok=true;assert.equal((await login()).status,429);assert.equal(calls,7);
 assert.equal((await login('otro@example.test')).status,200);
 await db.prepare('UPDATE login_guard SET until_ts=0,blocked=0').run();
 assert.equal((await login()).status,200);
});
test('la concurrencia no multiplica los intentos; un fallo externo no suma y un acierto reinicia el contador',async()=>{
 const {guardPassword}=await import('../server/login-guard.mjs');
 const db=localLoginDb(),email='a@example.test';
 const bad=()=>Promise.reject(Object.assign(new Error('incorrecta'),{authCode:'invalid_credentials'}));
 for(let i=0;i<6;i++)await assert.rejects(guardPassword(db,email,bad),/incorrecta/);
 await assert.rejects(guardPassword(db,email,()=>Promise.reject(new Error('red'))),/red/);
 let release,started;const start=new Promise(ok=>started=ok);
 const pending=guardPassword(db,email,()=>new Promise(ok=>{release=ok;started()}));
 await start;await assert.rejects(guardPassword(db,email,bad),{status:429});release(true);await pending;
 await assert.rejects(guardPassword(db,email,bad),/incorrecta/);
 assert.equal((await db.prepare('SELECT failures FROM login_guard').first()).failures,1);
});
