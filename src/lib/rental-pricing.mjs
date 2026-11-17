/** @typedef {'PEN'|'USD'} Currency */
/** @typedef {'daily'|'weeklyPerDay'|'monthly'|'deposit'} RateKey */
/** @typedef {{daily:number|null, weeklyPerDay:number|null, monthly:number|null, deposit:number|null, currencies?:Partial<Record<RateKey,Currency>>}} RentalRates */
/** @typedef {{weeklyFrom:number, monthlyFrom:number, monthlyDivisor:number, stackPromotion:boolean}} RentalRules */
/** @typedef {{id:string, vehicleId:string, campaignId?:string, category?:string, title:string, banner:string, terms:string, starts:string, ends:string, cents:number, currency?:Currency, regularCents:number|null, published:boolean}} RentalPromotion */
/** @typedef {{id:string, name:string, cents:number, currency?:Currency, active:boolean}} RentalExtra */
/** @typedef {{id:string, cents:number|null, currency?:Currency, unit:string}} ServiceRate */
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
/** @param {number} cents @param {Currency} [currency] */
export const formatMoney = (cents, currency = 'PEN') => `${currency === 'USD' ? 'US$' : 'S/'} ${soles.format(cents / 100)}`;
/** @param {RentalRates|undefined} rates @param {RateKey} key @returns {Currency} */
export const rateCurrency = (rates, key) => rates?.currencies?.[key] ?? 'PEN';
/** @param {Partial<Record<Currency,number>>} totals */
export const formatTotals = totals => Object.entries(totals).map(([currency, cents]) => formatMoney(cents, /** @type {Currency} */ (currency))).join(' + ');

/** @param {RentalRates} [rates] @param {RentalRules} [rules] */
export function startingRentalRate(rates, rules = defaultRentalRules) {
  return startingRentalRates(rates, rules)[0] ?? null;
}

/** Minimum within each currency; currencies are never compared or converted.
 * @param {RentalRates} [rates] @param {RentalRules} [rules] */
export function startingRentalRates(rates, rules = defaultRentalRules) {
  if (!rates) return [];
  const options = [
    { cents: rates.daily, currency: rateCurrency(rates, 'daily'), divisor: 1, term: `De 1 a ${rules.weeklyFrom - 1} días` },
    { cents: rates.weeklyPerDay, currency: rateCurrency(rates, 'weeklyPerDay'), divisor: 1, term: `De ${rules.weeklyFrom} a ${rules.monthlyFrom - 1} días` },
    { cents: rates.monthly, currency: rateCurrency(rates, 'monthly'), divisor: rules.monthlyDivisor, term: `Desde ${rules.monthlyFrom} días · equivalente diario` },
  ];
  const available = options.flatMap(({ cents, currency, divisor, term }) => cents == null ? [] : [{ centsPerDay: Math.round(cents / divisor), currency, term }]);
  return minimumRatesByCurrency(available);
}

/** @template {{centsPerDay:number,currency:Currency}} T @param {T[]} rates @returns {T[]} */
export function minimumRatesByCurrency(rates) {
  return /** @type {Currency[]} */ (['PEN', 'USD']).flatMap(currency => {
    const first = rates.filter(rate => rate.currency === currency).sort((a,b) => a.centsPerDay - b.centsPerDay)[0];
    return first ? [first] : [];
  });
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

/** @param {string} pickup @param {string} dropoff @param {number} [now] */
export function validateRentalDates(pickup, dropoff, now = Date.now()) {
  const start = limaTime(pickup);
  const end = limaTime(dropoff);
  if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error('Indique fechas y horas válidas.');
  if (pickup.slice(0, 10) < limaDate(now)) throw new Error('Elija hoy o una fecha futura para el recojo.');
  if (end <= start) throw new Error('La devolución debe ser posterior al recojo.');
  return { start, end };
}

/** Minimum selectable return; treats the input as Lima wall time, independent of browser timezone.
 * @param {string} pickup @param {string} today */
export function minimumReturn(pickup, today) {
  const start = limaTime(pickup);
  const minimum = `${today}T00:00`;
  if (!Number.isFinite(start)) return minimum;
  const next = new Date(start - limaOffset + 60000).toISOString().slice(0, 16);
  return next > minimum ? next : minimum;
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
  const { start, end } = validateRentalDates(pickup, dropoff, now);

  const rules = options.rules ?? defaultRentalRules;
  const days = Math.ceil((end - start) / dayMs);
  const monthly = days >= rules.monthlyFrom;
  const weekly = days >= rules.weeklyFrom && !monthly;
  let rate = monthly ? rates.monthly : weekly ? rates.weeklyPerDay : rates.daily;
  let currency = rateCurrency(rates, monthly ? 'monthly' : weekly ? 'weeklyPerDay' : 'daily');
  let divisor = monthly ? rules.monthlyDivisor : 1;
  let tier = monthly ? 'Mensual' : weekly ? 'Semanal' : 'Diaria';
  const promotion = options.promotion;
  const applies = promotion && promotionIsActive(promotion, limaDate(now)) && promotionIsActive(promotion, pickup.slice(0, 10));
  let rental = rate === null ? null : Math.round(rate * days / divisor);
  if (applies) {
    const regular = promotion.regularCents;
    if (rules.stackPromotion && rate !== null && regular && currency === (promotion.currency ?? 'PEN')) {
      rental = Math.round((rate / divisor) * (promotion.cents / regular) * days);
      tier += ' con promoción';
    } else {
      rate = promotion.cents;
      currency = promotion.currency ?? 'PEN';
      divisor = 1;
      rental = rate * days;
      tier = 'Promocional';
    }
  }
  const extras = (options.extras ?? []).filter(extra => extra.active);
  /** @type {Partial<Record<Currency,number>>} */
  const extrasTotals = {};
  for (const extra of extras) {
    const unit = extra.currency ?? 'PEN';
    extrasTotals[unit] = (extrasTotals[unit] ?? 0) + extra.cents * days;
  }
  const totals = { ...extrasTotals };
  if (rental !== null) totals[currency] = (totals[currency] ?? 0) + rental;
  const mixedCurrencies = Object.keys(totals).length > 1;
  const extrasTotal = Object.keys(extrasTotals).length > 1 ? null : Object.values(extrasTotals)[0] ?? 0;
  return {
    days, tier, rate, chargeDivisor:divisor, rateUnit: divisor === 1 && (!monthly || tier === 'Promocional') ? 'día' : 'mes',
    currency, depositCurrency: rateCurrency(rates, 'deposit'),
    deposit: rates.deposit, extras, extrasTotal, extrasTotals, totals, mixedCurrencies,
    rental, promotion: applies ? promotion.title : null,
    total: rental === null || mixedCurrencies ? null : totals[currency] ?? null,
  };
}
