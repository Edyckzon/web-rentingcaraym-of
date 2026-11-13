import { defaultRentalRules } from '../src/lib/rental-pricing.mjs';

export async function commercialCatalog(rest, bearer = null) {
  const read = path => rest(path, {}, bearer).catch(error => {
    if (!error.message.includes('PGRST205')) throw error;
    return [];
  });
  const [settings, extras, promotions, services] = await Promise.all([
    read('reglas_alquiler?id=eq.1'),
    read('extras_alquiler?order=nombre,id'),
    read('promociones_alquiler?order=inicio,id'),
    read('tarifas_servicios?order=servicio'),
  ]);
  const rules = settings[0];
  return {
    rules: rules ? {
      weeklyFrom: rules.semanal_desde, monthlyFrom: rules.mensual_desde,
      monthlyDivisor: rules.dias_prorrateo, stackPromotion: rules.acumular,
    } : defaultRentalRules,
    extras: extras.map(row => ({ id: row.id, name: row.nombre, cents: row.precio_centimos, active: row.activo })),
    promotions: promotions.map(row => ({
      id: row.id, vehicleId: row.vehiculo_id, title: row.nombre, banner: row.texto, terms: row.bases,
      ...(row.campania_id ? { campaignId: row.campania_id, category: row.categoria_campania } : {}),
      starts: row.inicio, ends: row.fin, cents: row.precio_centimos, regularCents: row.regular_centimos, published: row.publicada,
    })),
    services: services.map(row => ({ id:row.servicio, cents:row.precio_centimos, unit:row.unidad })),
  };
}

function checkedText(value, limit, required = true) {
  if (typeof value !== 'string' || value.length > limit || (required && !value.trim())) return null;
  return value.trim();
}

const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
const date = /^\d{4}-\d{2}-\d{2}$/;
const vehicleId = /^[a-z0-9-]{1,100}$/;

export async function saveCommercial(path, input, rest, fail) {
  if (!input || typeof input !== 'object') fail(400, 'Revise los campos.');
  if (path === 'service-rate') {
    const { id, cents } = input;
    const unit = checkedText(input.unit, 40, cents !== null);
    if (!['empresas','excavadora-cat-330dl','volquetes'].includes(id) || unit === null ||
      (cents !== null && !integer(cents, 1, 100000000))) fail(400, 'Revise el precio y la unidad del servicio.');
    await rest(`tarifas_servicios?servicio=eq.${id}`, { method:'PATCH', body:JSON.stringify({ precio_centimos:cents, unidad:unit }) });
    return;
  }
  if (path === 'rental-rules') {
    const { weeklyFrom, monthlyFrom, monthlyDivisor, stackPromotion } = input;
    if (!integer(weeklyFrom, 2, 90) || !integer(monthlyFrom, 3, 180) || monthlyFrom <= weeklyFrom
      || !integer(monthlyDivisor, 1, 366) || typeof stackPromotion !== 'boolean') fail(400, 'Revise los tramos y el divisor mensual.');
    await rest('reglas_alquiler?id=eq.1', { method: 'PATCH', body: JSON.stringify({
      semanal_desde: weeklyFrom, mensual_desde: monthlyFrom, dias_prorrateo: monthlyDivisor, acumular: stackPromotion,
    }) });
    return;
  }

  if (input.id && (typeof input.id !== 'string' || !uuid.test(input.id))) fail(400, 'Registro no válido.');
  let table;
  let values;
  if (path === 'rental-extra') {
    table = 'extras_alquiler';
    const name = checkedText(input.name, 100);
    if (!name || !integer(input.cents, 0, 100000000) || typeof input.active !== 'boolean') fail(400, 'Revise el nombre y el precio del extra.');
    values = { nombre: name, precio_centimos: input.cents, activo: input.active };
  } else {
    table = 'promociones_alquiler';
    const title = checkedText(input.title, 100);
    const terms = checkedText(input.terms, 4000);
    const banner = checkedText(input.banner, 200, false);
    if (!title || !terms || banner === null || !integer(input.cents, 1, 100000000)
      || typeof input.starts !== 'string' || !date.test(input.starts) || typeof input.ends !== 'string' || !date.test(input.ends)
      || input.ends < input.starts || typeof input.published !== 'boolean') fail(400, 'Revise la tarifa, vigencia y bases.');
    if (input.category !== undefined) {
      const category = checkedText(input.category, 60);
      const { campaignId, vehicleIds, preview } = input;
      if (!category || typeof campaignId !== 'string' || !uuid.test(campaignId) || typeof preview !== 'boolean'
        || !Array.isArray(vehicleIds) || !vehicleIds.length || vehicleIds.length > 1000
        || new Set(vehicleIds).size !== vehicleIds.length
        || vehicleIds.some(id => typeof id !== 'string' || !vehicleId.test(id))) fail(400, 'Revise la categoría y sus vehículos.');
      return await rest('rpc/guardar_promocion_categoria', { method: 'POST', body: JSON.stringify({
        ficha: { campaignId, category, vehicleIds, title, banner, terms, starts: input.starts, ends: input.ends, cents: input.cents, published: input.published },
        simular: preview,
      }) });
    }
    if (typeof input.vehicleId !== 'string' || !vehicleId.test(input.vehicleId)) fail(400, 'Elija un vehículo.');
    values = {
      vehiculo_id: input.vehicleId, nombre: title, texto: banner, bases: terms,
      inicio: input.starts, fin: input.ends, precio_centimos: input.cents, publicada: input.published,
    };
  }
  const individualOnly = table === 'promociones_alquiler' ? '&campania_id=is.null' : '';
  const updated = await rest(input.id ? `${table}?id=eq.${input.id}${individualOnly}` : table, {
    method: input.id ? 'PATCH' : 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(values),
  });
  if (!updated?.length) fail(404, 'El registro ya no existe.');
}

export async function saveFreightDraft(input, rest, fail) {
  if (!input || (input.id && (typeof input.id !== 'string' || !uuid.test(input.id)))) fail(400, 'Ruta no válida.');
  const origin = checkedText(input.origin, 100);
  const destination = checkedText(input.destination, 100);
  const description = checkedText(input.description, 4000, false);
  const duration = checkedText(input.duration, 100, false);
  if (!origin || !destination || description === null || duration === null ||
    (input.cents !== null && !integer(input.cents, 1, 100000000))) fail(400, 'Revise origen, destino y tarifa.');
  const record = await rest(input.id ? `rutas_carga_borrador?id=eq.${input.id}` : 'rutas_carga_borrador', {
    method: input.id ? 'PATCH' : 'POST', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ origen:origin, destino:destination, descripcion:description, tiempo_estimado:duration, precio_centimos:input.cents }),
  });
  if (!record?.length) fail(404, 'No se encontró la ruta.');
  return record[0];
}
