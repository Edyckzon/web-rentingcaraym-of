// A content fingerprint, never a credential. Shared by the build and publishing API.
function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
 return value;
}
export async function contentRevision(content){
 const {covers,...publicContent}=content;
 const bytes=new TextEncoder().encode(JSON.stringify(canonical(publicContent)));
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
}
