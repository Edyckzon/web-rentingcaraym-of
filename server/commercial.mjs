import { defaultRentalRules, limaDate } from '../src/lib/rental-pricing.mjs';

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
    priceDisplay: { enabled: rules?.mostrar_equivalencias ?? false, showRate:rules?.mostrar_tipo_cambio ?? true, source: rules?.fuente_cambio ?? 'bcrp',
      manualRate: rules?.cambio_manual == null ? null : Number(rules.cambio_manual), manualDate:rules?.fecha_cambio_manual ?? null },
    rules: rules ? {
      weeklyFrom: rules.semanal_desde, monthlyFrom: rules.mensual_desde,
      monthlyDivisor: rules.dias_prorrateo, stackPromotion: rules.acumular,
    } : defaultRentalRules,
    extras: extras.map(row => ({ id: row.id, name: row.nombre, cents: row.precio_centimos, currency: row.moneda ?? 'PEN', active: row.activo })),
    promotions: promotions.map(row => ({
      id: row.id, vehicleId: row.vehiculo_id, title: row.nombre, banner: row.texto, terms: row.bases,
      ...(row.campania_id ? { campaignId: row.campania_id, category: row.categoria_campania } : {}),
      starts: row.inicio, ends: row.fin, cents: row.precio_centimos, currency: row.moneda ?? 'PEN', regularCents: row.regular_centimos, published: row.publicada,
    })),
    services: services.map(row => ({ id:row.servicio, cents:row.precio_centimos, currency:row.moneda ?? 'PEN', unit:row.unidad,secondary:row.alternativa_centimos??null,secondaryMode:row.alternativa_modo??'tc' })),
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
function currencyPatch(input, fail) {
  if (input.currency === undefined) return {};
  if (!['PEN','USD'].includes(input.currency)) fail(400, 'Elija soles (PEN) o dólares (USD).');
  return { moneda: input.currency };
}

export async function saveCommercial(path, input, rest, fail) {
  if (!input || typeof input !== 'object') fail(400, 'Revise los campos.');
  const money = currencyPatch(input, fail);
  if (path === 'rental-display') {
    const { enabled, showRate, source, manualRate, manualDate } = input;
    if (typeof enabled !== 'boolean' || typeof showRate !== 'boolean' || !['bcrp','manual'].includes(source)) fail(400,'Revise la visualización de monedas.');
    if (source === 'manual' && (typeof manualRate !== 'number' || !Number.isFinite(manualRate) || manualRate < 0.1 || manualRate > 100
      || Math.abs(manualRate * 10000 - Math.round(manualRate * 10000)) > 0.000001
      || typeof manualDate !== 'string' || !date.test(manualDate) || !Number.isFinite(Date.parse(manualDate))
      || new Date(manualDate).toISOString().slice(0,10) !== manualDate || manualDate > limaDate())) {
      fail(400,'Indique un tipo de cambio entre 0.1 y 100, hasta cuatro decimales y una fecha válida hasta hoy.');
    }
    await rest('reglas_alquiler?id=eq.1', { method:'PATCH', body:JSON.stringify({
      mostrar_equivalencias:enabled, mostrar_tipo_cambio:showRate, fuente_cambio:source,
      cambio_manual:source === 'manual' ? manualRate : null, fecha_cambio_manual:source === 'manual' ? manualDate : null,
    }) });
    return;
  }
  if (path === 'service-rate') {
    const { id, cents } = input;
    const unit = checkedText(input.unit, 40, cents !== null);
    if (!['empresas','maquinaria-y-transporte','excavadora-cat-330dl','volquetes','transporte-de-carga'].includes(id) || unit === null ||
      (cents !== null && !integer(cents, 1, 100000000))) fail(400, 'Revise el precio y la unidad del servicio.');
    const alternative={};
    if(input.secondary!==undefined||input.secondaryMode!==undefined){
      if(!['manual','tc'].includes(input.secondaryMode)||(input.secondary!==null&&!integer(input.secondary,1,100000000))
        ||(input.secondaryMode==='manual'&&cents!==null&&input.secondary===null))fail(400,'Digite el segundo precio o elija calcularlo con el TC.');
      alternative.alternativa_centimos=input.secondary;alternative.alternativa_modo=input.secondaryMode;
    }
    await rest(`tarifas_servicios?servicio=eq.${id}`, { method:'PATCH', body:JSON.stringify({ precio_centimos:cents, unidad:unit, ...money,...alternative }) });
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
    values = { nombre: name, precio_centimos: input.cents, activo: input.active, ...money };
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
        ficha: { campaignId, category, vehicleIds, title, banner, terms, starts: input.starts, ends: input.ends, cents: input.cents, published: input.published, ...(input.currency === undefined ? {} : { currency: input.currency }) },
        simular: preview,
      }) });
    }
    if (typeof input.vehicleId !== 'string' || !vehicleId.test(input.vehicleId)) fail(400, 'Elija un vehículo.');
    values = {
      vehiculo_id: input.vehicleId, nombre: title, texto: banner, bases: terms,
      inicio: input.starts, fin: input.ends, precio_centimos: input.cents, publicada: input.published, ...money,
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
    body: JSON.stringify({ origen:origin, destino:destination, descripcion:description, tiempo_estimado:duration, precio_centimos:input.cents, ...currencyPatch(input, fail) }),
  });
  if (!record?.length) fail(404, 'No se encontró la ruta.');
  return record[0];
}
