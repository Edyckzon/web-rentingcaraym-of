import test from 'node:test';
import assert from 'node:assert/strict';
import { marketingAPI } from '../server/marketing-api.mjs';
import { limaDate } from '../src/lib/rental-pricing.mjs';

const env = {
  SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test', SUPABASE_SECRET_KEY:'sb_secret_test',
  TURNSTILE_SITE_KEY:'test-site', TURNSTILE_SECRET_KEY:'test-secret',
  RESEND_API_KEY:'test-mail', RENTAL_MAIL_FROM:'test@example.test', RENTAL_MAIL_TO:'reservas@example.test',
};
const origin = 'https://renting.example';
const day = offset => limaDate(Date.now() + offset * 86400000);
const payload = {
  id:'12345678-1234-1234-1234-123456789abc', vehicleId:'ford-territory',
  pickup:`${day(2)}T10:00`, dropoff:`${day(5)}T10:00`, place:'surco', extras:[], expectedTotal:36000,
  name:'Prueba', phone:'999000111', email:'', document:'', comment:'', consent:true, turnstile:'test',
};
const request = input => new Request(`${origin}/marketing-api/rental-request/`, {
  method:'POST', headers:{ Origin:origin, 'Content-Type':'application/json' }, body:JSON.stringify(input),
});

test('recalcula importes, rechaza cambios de tarifa y conserva la solicitud si falla el correo', async t => {
  const saved = [];
  let mails = 0;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    const link = String(url);
    if (link.includes('/siteverify')) return Response.json({ success:true, action:'solicitud_alquiler', hostname:'renting.example' });
    if (link.includes('/vehiculos?')) return Response.json([{ id:'ford-territory', nombre:'Ford Territory', tarifa_diaria_centimos:12000, garantia_centimos:80000 }]);
    if (link.includes('/rpc/recibir_solicitud_alquiler')) {
      assert.equal(options.headers.apikey, env.SUPABASE_SECRET_KEY);
      saved.push(JSON.parse(options.body).ficha);
      return Response.json(false);
    }
    if (link === 'https://api.resend.com/emails') {
      mails++;
      assert.equal(options.headers['Idempotency-Key'], `rental/${payload.id}`);
      assert.ok(!JSON.parse(options.body).text.includes(payload.phone));
      return Response.json({}, { status:503 });
    }
    if (link.includes('/rest/v1/')) return Response.json([]);
    throw new Error('Llamada no esperada');
  });
  assert.equal((await marketingAPI(request({ ...payload, expectedTotal:1 }), env)).status, 409);
  assert.equal(saved.length, 0);
  const result = await marketingAPI(request(payload), env);
  assert.equal(result.status, 201);
  assert.deepEqual(await result.json(), { id:payload.id, notified:false });
  assert.equal(saved[0].quote.total, 36000);
  assert.equal(saved[0].quote.deposit, 80000);
  assert.equal(mails, 1);
});

test('formulario sin configuración y bandeja sin sesión permanecen cerrados', async () => {
  assert.equal((await marketingAPI(request(payload), { SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test' })).status, 503);
  assert.equal((await marketingAPI(new Request(`${origin}/marketing-api/rental-inbox/`), env)).status, 401);
});
