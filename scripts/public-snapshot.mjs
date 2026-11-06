import {writeFile} from 'node:fs/promises';
import {marketingAPI} from '../server/marketing-api.mjs';
try{process.loadEnvFile('.marketing/auth.env')}catch(e){if(e.code!=='ENOENT')throw e}
if(process.env.SUPABASE_PUBLISHABLE_KEY){
 const r=await marketingAPI(new Request('https://preview.invalid/marketing-api/public'),process.env);
 if(!r.ok)throw Error('No se pudo leer el catálogo público de Supabase para la exportación.');
 const content=await r.json();
 await writeFile('src/lib/marketing-public.json',JSON.stringify({...content,covers:{}},null,2)+'\n');
}
