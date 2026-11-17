// BCRP interbank reference. This is not a contractual conversion or a SUNAT rate.
const endpoint = 'https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04637PD-PD04638PD/json';
export const exchangeSource = 'https://estadisticas.bcrp.gob.pe/estadisticas/series/diarias/tipo-de-cambio-nominal';
const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Set','Oct','Nov','Dic'];
let cached;
let expires = 0;
let pending;

export function parseExchangeRate(data, now = Date.now()) {
  const today = new Date(now - 5 * 3600000).toISOString().slice(0,10);
  const rows = (Array.isArray(data?.periods) ? data.periods : []).flatMap(row => {
    const match = /^(\d{1,2})\.([A-Za-z]{3})\.(\d{2}|\d{4})$/.exec(row.name ?? '');
    if (!match) return [];
    const month = months.findIndex(name => name.toLowerCase() === match[2].toLowerCase()) + 1;
    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
    const date = `${year}-${String(month).padStart(2,'0')}-${match[1].padStart(2,'0')}`;
    const [buy, sell] = (row.values ?? []).map(Number);
    if (!month || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date || date > today
      || !Number.isFinite(buy) || !Number.isFinite(sell) || buy <= 0 || sell <= 0) return [];
    return [{ date, buy, sell }];
  }).sort((a,b) => b.date.localeCompare(a.date));
  const latest = rows[0];
  return latest ? { available:true, ...latest, today:latest.date === today, source:'BCRP', url:exchangeSource } : null;
}

export async function exchangeRate() {
  if (cached && Date.now() < expires) return cached;
  if (pending) return pending;
  pending = (async () => {
    try {
      const response = await fetch(endpoint, {
        headers:{ Accept:'application/json', 'User-Agent':'Mozilla/5.0 (compatible; RentingCarAYM/1.0; +https://rentingcaraym.com)' },
        signal:AbortSignal.timeout(5000), cf:{ cacheTtl:3600, cacheEverything:true },
      });
      if (!response.ok) throw new Error('BCRP unavailable');
      const rate = parseExchangeRate(await response.json());
      if (!rate) throw new Error('No valid observation');
      cached = rate;
      expires = Date.now() + 3600000;
    } catch {
      cached = { available:false, source:'BCRP', url:exchangeSource };
      expires = Date.now() + 60000;
    } finally { pending = null; }
    return cached;
  })();
  return pending;
}
