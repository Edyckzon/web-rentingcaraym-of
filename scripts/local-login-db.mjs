import {DatabaseSync} from 'node:sqlite';

// D1 uses SQLite. Use the same statements in Node development and tests.
export function localLoginDb(file=':memory:'){
  const sqlite=new DatabaseSync(file);
  function prepare(sql,values=[]){
    const stmt=()=>sqlite.prepare(sql);
    return {bind:(...params)=>prepare(sql,params),first:async()=>stmt().get(...values)??null,run:async()=>stmt().run(...values)};
  }
  return {prepare,batch:async statements=>{for(const statement of statements)await statement.run();}};
}
