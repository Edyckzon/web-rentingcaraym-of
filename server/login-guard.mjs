const WINDOW=900, LEASE=45;
const schemas=new WeakMap();
const retry=seconds=>Object.assign(new Error('Demasiados intentos. Vuelve a intentar en '+Math.max(1,Math.ceil(seconds/60))+' min.'),{status:429,retryAfter:seconds});
async function initialize(db){
  if(!schemas.has(db)){
    const setup=db.batch([
      db.prepare('CREATE TABLE IF NOT EXISTS login_guard (account TEXT PRIMARY KEY, failures INTEGER NOT NULL, until_ts INTEGER NOT NULL, blocked INTEGER NOT NULL, ticket TEXT NOT NULL, lease INTEGER NOT NULL)'),
      db.prepare('CREATE INDEX IF NOT EXISTS login_guard_expiry ON login_guard(until_ts)')
    ]).catch(e=>{schemas.delete(db);throw e});
    schemas.set(db,setup);
  }
  await schemas.get(db);
}
// One outstanding password check per account, shared across Pages instances.
// Only the holder of the current ticket may record the result.
export async function guardPassword(db,email,verify){
  if(!db)throw Object.assign(new Error('Acceso temporalmente no disponible.'),{status:503});
  await initialize(db);
  const account=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(email))),b=>b.toString(16).padStart(2,'0')).join('');
  const ticket=crypto.randomUUID();
  await db.prepare('DELETE FROM login_guard WHERE until_ts<=unixepoch() AND lease<=unixepoch()').run();
  const slot=await db.prepare(`INSERT INTO login_guard VALUES (?,0,unixepoch()+?,0,?,unixepoch()+?)
    ON CONFLICT(account) DO UPDATE SET ticket=excluded.ticket,lease=excluded.lease
    WHERE login_guard.lease<=unixepoch() AND login_guard.blocked<=unixepoch()
    RETURNING ticket`).bind(account,WINDOW,ticket,LEASE).first();
  if(!slot){
    const row=await db.prepare('SELECT max(blocked,lease)-unixepoch() AS wait FROM login_guard WHERE account=?').bind(account).first();
    throw retry(Math.max(1,row?.wait||1));
  }
  let user;
  try{user=await verify();}
  catch(e){
    if(e.authCode==='invalid_credentials'){
      const row=await db.prepare(`UPDATE login_guard SET failures=failures+1, ticket='', lease=0,
        blocked=CASE WHEN failures>=6 THEN unixepoch()+? ELSE 0 END,
        until_ts=CASE WHEN failures>=6 THEN unixepoch()+? ELSE until_ts END
        WHERE account=? AND ticket=? RETURNING blocked-unixepoch() AS wait`).bind(WINDOW,WINDOW,account,ticket).first();
      if(row?.wait>0)throw retry(row.wait);
    }else{
      await db.prepare("UPDATE login_guard SET ticket='',lease=0 WHERE account=? AND ticket=?").bind(account,ticket).run();
    }
    throw e;
  }
  const cleared=await db.prepare('DELETE FROM login_guard WHERE account=? AND ticket=? RETURNING account').bind(account,ticket).first();
  if(!cleared)throw retry(1);
  return user;
}
