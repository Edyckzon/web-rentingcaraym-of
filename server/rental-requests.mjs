import { commercialCatalog } from './commercial.mjs';
import { emptyRentalRates, estimateRental } from '../src/lib/rental-pricing.mjs';

export function requestSiteKey(env) {
  const configured = env.SUPABASE_SECRET_KEY?.startsWith('sb_secret_') && env.TURNSTILE_SECRET_KEY
    && env.RESEND_API_KEY && env.RENTAL_MAIL_FROM && env.RENTAL_MAIL_TO;
  return configured ? env.TURNSTILE_SITE_KEY : undefined;
}

const requestId = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
const emailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function receiveRentalRequest(request, env, { rest, fail, vehicleRates, project }) {
  if (!requestSiteKey(env)) fail(503, 'La solicitud en línea aún no está habilitada. Puede consultar por WhatsApp.');
  const raw = await request.text();
  if (raw.length > 12000) fail(413, 'La solicitud excede el tamaño permitido.');
  let input;
  try { input = JSON.parse(raw); }
  catch { fail(400, 'Solicitud no válida.'); }
  if (!input || typeof input.id !== 'string' || !requestId.test(input.id) || typeof input.vehicleId !== 'string'
    || !/^[a-z0-9-]{1,100}$/.test(input.vehicleId) || input.consent !== true) {
    fail(400, 'Revise el vehículo y el consentimiento.');
  }
  const contact = {};
  for (const [key, limit] of [['name',100],['phone',25],['email',160],['document',20],['comment',1200]]) {
    if (typeof input[key] !== 'string' || input[key].length > limit) fail(400, 'Revise los datos de contacto.');
    contact[key] = input[key].trim();
  }
  if (!contact.name || !/^\+?[\d ()-]{7,25}$/.test(contact.phone) || contact.phone.replace(/\D/g,'').length < 7
    || (contact.email && !emailAddress.test(contact.email)) || (contact.document && !/^[\dA-Za-z-]{6,20}$/.test(contact.document))) {
    fail(400, 'Revise nombre, teléfono y datos opcionales.');
  }
  if (typeof input.pickup !== 'string' || typeof input.dropoff !== 'string' || !['surco','lima'].includes(input.place)
    || !Array.isArray(input.extras) || input.extras.length > 20 || input.extras.some(value => typeof value !== 'string' || !requestId.test(value))) {
    fail(400, 'Revise las fechas, el lugar y los extras de la cotización.');
  }
  if (typeof input.turnstile !== 'string' || !input.turnstile || input.turnstile.length > 2048) fail(400, 'Complete la verificación antes de enviar.');

  const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: input.turnstile }),
    signal: AbortSignal.timeout(8000),
  });
  if (!verification.ok) fail(503, 'No se pudo verificar la solicitud. Inténtelo nuevamente.');
  const challenge = await verification.json();
  if (!challenge.success || challenge.action !== 'solicitud_alquiler' || challenge.hostname !== new URL(request.url).hostname) {
    fail(400, 'La verificación venció. Complete una nueva y vuelva a enviar.');
  }

  const [vehicles, catalog] = await Promise.all([
    rest(`vehiculos?id=eq.${encodeURIComponent(input.vehicleId)}&select=*`, {}, null),
    commercialCatalog(rest),
  ]);
  const vehicle = vehicles[0];
  if (!vehicle) fail(404, 'Este vehículo ya no está disponible en el catálogo.');
  const extras = catalog.extras.filter(extra => input.extras.includes(extra.id));
  if (extras.length !== new Set(input.extras).size) fail(409, 'Los extras cambiaron. Vuelva a calcular el alquiler.');
  const promotion = catalog.promotions.find(p => p.vehicleId === vehicle.id);
  let estimate;
  try {
    estimate = estimateRental(vehicleRates(vehicle) ?? emptyRentalRates, input.pickup, input.dropoff, Date.now(), { rules: catalog.rules, promotion, extras });
  } catch (error) { fail(400, error.message); }
  if (estimate.total !== input.expectedTotal) fail(409, 'La tarifa cambió. Vuelva a calcular antes de enviar.');

  async function serverRpc(name, payload) {
    const response = await fetch(`${project}/rest/v1/rpc/${name}`, {
      method: 'POST', headers: { apikey: env.SUPABASE_SECRET_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) fail(response.status === 409 ? 409 : 502, 'No se pudo guardar la solicitud. Inténtelo nuevamente.');
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  const alreadyNotified = await serverRpc('recibir_solicitud_alquiler', { ficha: {
    id: input.id, vehicleId: vehicle.id, ...contact,
    quote: { ...estimate, vehicle: vehicle.nombre, pickup: input.pickup, dropoff: input.dropoff, place: input.place },
  } });
  if (alreadyNotified) return { id: input.id, notified: true };

  let notified = false;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `rental/${input.id}` },
      body: JSON.stringify({ from: env.RENTAL_MAIL_FROM, to: [env.RENTAL_MAIL_TO],
        subject: 'Nueva solicitud de alquiler · Renting Car A&M',
        text: `Hay una nueva solicitud en el administrador.\nModelo: ${vehicle.nombre}\nCódigo: ${input.id}\nhttps://rentingcaraym.com/admin/`,
      }),
    });
    if (response.ok) {
      await serverRpc('solicitud_alquiler_notificada', { solicitud: input.id });
      notified = true;
    }
  } catch { /* A notification failure must not discard a stored request. */ }
  return { id: input.id, notified };
}
