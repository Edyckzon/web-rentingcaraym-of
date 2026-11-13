/** @typedef {{daily:number|null, weeklyPerDay:number|null, monthly:number|null, deposit:number|null}} RentalRates */
/** @typedef {{weeklyFrom:number, monthlyFrom:number, monthlyDivisor:number, stackPromotion:boolean}} RentalRules */
/** @typedef {{id:string, vehicleId:string, campaignId?:string, category?:string, title:string, banner:string, terms:string, starts:string, ends:string, cents:number, regularCents:number|null, published:boolean}} RentalPromotion */
/** @typedef {{id:string, name:string, cents:number, active:boolean}} RentalExtra */
/** @typedef {{id:string, cents:number|null, unit:string}} ServiceRate */
/** @typedef {{rules:RentalRules, promotions:RentalPromotion[], extras:RentalExtra[], services:ServiceRate[], requestSiteKey?:string}} CommercialCatalog */

/** @type {RentalRates} */
export const emptyRentalRates = { daily: null, weeklyPerDay: null, monthly: null, deposit: null };
/** @type {RentalRules} */
export const defaultRentalRules = { weeklyFrom: 7, monthlyFrom: 30, monthlyDivisor: 30, stackPromotion: false };
/** @type {CommercialCatalog} */
export const emptyCommercialCatalog = { rules: defaultRentalRules, promotions: [], extras: [], services: [] };

const soles = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** @param {number} cents */
export const formatSoles = cents => `S/ ${soles.format(cents / 100)}`;

/** @param {RentalRates} [rates] @param {RentalRules} [rules] */
export function startingRentalRate(rates, rules = defaultRentalRules) {
  if (!rates) return null;
  const options = [
    { cents: rates.daily, divisor: 1, term: `De 1 a ${rules.weeklyFrom - 1} días` },
    { cents: rates.weeklyPerDay, divisor: 1, term: `De ${rules.weeklyFrom} a ${rules.monthlyFrom - 1} días` },
    { cents: rates.monthly, divisor: rules.monthlyDivisor, term: `Desde ${rules.monthlyFrom} días · equivalente diario` },
  ];
  const available = options.flatMap(({ cents, divisor, term }) => cents === null ? [] : [{ perDay: cents / divisor, term }]);
  available.sort((a, b) => a.perDay - b.perDay);
  const first = available[0];
  return first ? { centsPerDay: Math.round(first.perDay), term: first.term } : null;
}

const dayMs = 24 * 60 * 60 * 1000;
const limaOffset = 5 * 60 * 60 * 1000;
export const limaDate = (now = Date.now()) => new Date(now - limaOffset).toISOString().slice(0, 10);

/** @param {string} value */
function limaTime(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return NaN;
  const wallTime = Date.parse(`${value}:00Z`);
  if (!Number.isFinite(wallTime) || new Date(wallTime).toISOString().slice(0, 16) !== value) return NaN;
  return wallTime + limaOffset;
}

/** @param {RentalPromotion} promotion @param {string} [date] */
export function promotionIsActive(promotion, date = limaDate()) {
  return promotion.published && promotion.starts <= date && date <= promotion.ends;
}

/**
 * @param {RentalRates} rates
 * @param {string} pickup
 * @param {string} dropoff
 * @param {number} [now]
 * @param {{rules?:RentalRules, promotion?:RentalPromotion, extras?:RentalExtra[]}} [options]
 */
export function estimateRental(rates, pickup, dropoff, now = Date.now(), options = {}) {
  const start = limaTime(pickup);
  const end = limaTime(dropoff);
  if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error('Indique fechas y horas válidas.');
  if (start < Math.floor(now / 60000) * 60000) throw new Error('El recojo debe ser desde la fecha y hora actual.');
  if (end <= start) throw new Error('La devolución debe ser posterior al recojo.');

  const rules = options.rules ?? defaultRentalRules;
  const days = Math.ceil((end - start) / dayMs);
  const monthly = days >= rules.monthlyFrom;
  const weekly = days >= rules.weeklyFrom && !monthly;
  let rate = monthly ? rates.monthly : weekly ? rates.weeklyPerDay : rates.daily;
  let divisor = monthly ? rules.monthlyDivisor : 1;
  let tier = monthly ? 'Mensual' : weekly ? 'Semanal' : 'Diaria';
  const promotion = options.promotion;
  const applies = promotion && promotionIsActive(promotion, limaDate(now)) && promotionIsActive(promotion, pickup.slice(0, 10));
  let rental = rate === null ? null : Math.round(rate * days / divisor);
  if (applies) {
    const regular = promotion.regularCents;
    if (rules.stackPromotion && rate !== null && regular) {
      rental = Math.round((rate / divisor) * (promotion.cents / regular) * days);
      tier += ' con promoción';
    } else {
      rate = promotion.cents;
      divisor = 1;
      rental = rate * days;
      tier = 'Promocional';
    }
  }
  const extras = (options.extras ?? []).filter(extra => extra.active);
  const extrasTotal = extras.reduce((sum, extra) => sum + extra.cents * days, 0);
  return {
    days, tier, rate, rateUnit: divisor === 1 && (!monthly || tier === 'Promocional') ? 'día' : 'mes',
    deposit: rates.deposit, extras, extrasTotal, promotion: applies ? promotion.title : null,
    total: rental === null ? null : rental + extrasTotal,
  };
}
