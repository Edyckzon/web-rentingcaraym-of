import {writeFile,readFile} from 'node:fs/promises';
import {contentRevision} from '../server/publication.mjs';
import {marketingAPI} from '../server/marketing-api.mjs';
try{process.loadEnvFile('.marketing/auth.env')}catch(e){if(e.code!=='ENOENT')throw e}
if(process.env.CF_PAGES==='1'&&!process.env.SUPABASE_PUBLISHABLE_KEY){
 throw Error('Configura SUPABASE_PUBLISHABLE_KEY en el entorno de compilación de Pages para publicar el catálogo y SEO actuales.');
}
if(process.env.SUPABASE_PUBLISHABLE_KEY){
 const r=await marketingAPI(new Request('https://preview.invalid/marketing-api/public'),process.env);
 if(!r.ok)throw Error('No se pudo leer el catálogo público de Supabase para la exportación.');
 const content=await r.json();
 await writeFile('src/lib/marketing-public.json',JSON.stringify({...content,covers:{}},null,2)+'\n');
}
const exportedContent=JSON.parse(await readFile('src/lib/marketing-public.json','utf8'));
await writeFile('public/seo-publication.json',JSON.stringify({revision:await contentRevision(exportedContent),builtAt:new Date().toISOString()})+'\n');
