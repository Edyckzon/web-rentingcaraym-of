import {localLoginDb} from './local-login-db.mjs';
import {mkdirSync} from 'node:fs';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {marketingAPI} from '../server/marketing-api.mjs';
try{process.loadEnvFile('.marketing/auth.env')}catch(e){if(e.code!=='ENOENT')throw e}
mkdirSync('.marketing',{recursive:true});
const env={...process.env,LOGIN_GUARD_DB:localLoginDb('.marketing/login-guard.sqlite')};
const origin='http://127.0.0.1:4318';
const server=createServer(async(req,res)=>{
 try{let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>6*1024*1024){res.writeHead(413).end();return;}chunks.push(chunk);}
 const request=new Request(origin+req.url,{method:req.method,headers:req.headers,...(chunks.length?{body:Buffer.concat(chunks)}:{})});
 const r=await marketingAPI(request,env);res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));
 }catch{res.writeHead(500).end();}
});
server.listen(4319,'127.0.0.1',()=>{
 const next=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','4318'],{stdio:'inherit',env:{...process.env,MARKETING_LOCAL:'1'}});
 next.on('exit',c=>{server.close();process.exit(c??0)});for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>next.kill());
});
