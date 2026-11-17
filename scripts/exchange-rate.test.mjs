import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseExchangeRate, exchangeRate } from '../server/exchange-rate.mjs';

test('BCRP usa última observación válida con fecha; no inventa el dato del día', () => {
  const result = parseExchangeRate({ periods:[
    { name:'13.Nov.26', values:['3.398857','3.401285'] },
    { name:'16.Nov.26', values:['n.d.','n.d.'] },
    { name:'30.Feb.26', values:['3','4'] },
    { name:'19.Nov.26', values:['3','4'] },
  ] }, Date.parse('2026-11-17T15:00:00Z'));
  assert.equal(result.date, '2026-11-13');
  assert.equal(result.today, false);
  assert.equal(result.sell, 3.401285);
  assert.equal(parseExchangeRate({ periods:[{name:'17.Nov.26',values:['0','<html>']}] }), null);
  assert.equal(parseExchangeRate({}), null);
});

test('fallo externo devuelve estado no disponible y evita reintentos por visita', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; throw new Error('timeout'); });
  assert.equal((await exchangeRate()).available, false);
  assert.equal((await exchangeRate()).available, false);
  assert.equal(calls, 1);
});

test('consulta BCRP como cliente identificado y reutiliza el resultado válido', async t => {
  const fresh = await import('../server/exchange-rate.mjs?success');
  let calls = 0;
  t.mock.method(globalThis,'fetch',async (url, options) => {
    calls++;
    assert.match(options.headers['User-Agent'], /RentingCarAYM/);
    return Response.json({periods:[{name:'13.Nov.26',values:['3.398857','3.401285']}]});
  });
  assert.equal((await fresh.exchangeRate()).available,true);
  assert.equal((await fresh.exchangeRate()).date,'2026-11-13');
  assert.equal(calls,1);
});
