import { limaDate } from './rental-pricing.mjs';

/** @typedef {{available:boolean,date?:string,sell?:number,buy?:number,today?:boolean}} ExchangeReference */
/** @param {number} cents @param {import('./rental-pricing.mjs').Currency} currency
 * @param {import('./rental-pricing.mjs').PriceDisplay|undefined} settings
 * @param {ExchangeReference|null} reference @param {number} [now] */
export function currencyEquivalent(cents, currency, settings, reference, now = Date.now()) {
  if (!settings?.enabled || !Number.isSafeInteger(cents) || cents < 0 || !['PEN','USD'].includes(currency)) return null;
  const manual = settings.source === 'manual';
  const rate = manual ? settings.manualRate : reference?.available ? reference.sell : null;
  const date = manual ? settings.manualDate : reference?.date;
  if (!rate || !Number.isFinite(rate) || rate <= 0 || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)
    || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date || date > limaDate(now)) return null;
  // A dated manual reference stays under admin control. Automatic observations expire after 7 days.
  if (!manual && Date.parse(limaDate(now)) - Date.parse(date) > 7 * 86400000) return null;
  const converted = Math.round(currency === 'PEN' ? cents / rate : cents * rate);
  if (!Number.isSafeInteger(converted)) return null;
  return { cents:converted, currency: /** @type {import('./rental-pricing.mjs').Currency} */ (currency === 'PEN' ? 'USD' : 'PEN'),
    rate, date, source:manual ? 'TC manual' : 'BCRP · venta' };
}
