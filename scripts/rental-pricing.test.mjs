import assert from 'node:assert/strict';
import { test } from 'node:test';
import { estimateRental, startingRentalRate, defaultRentalRules } from '../src/lib/rental-pricing.mjs';
import { saveCommercial } from '../server/commercial.mjs';

const rates = { daily: 12000, weeklyPerDay: 9500, monthly: 250001, deposit: 80000 };
const pickup = '2026-12-01T10:00';
const now = Date.parse('2026-12-01T15:00:50Z');

test('3, 10 y 35 días usan su tramo y excluyen la garantía del total', () => {
  for (const [dropoff, days, tier, total] of [
    ['2026-12-04T10:00', 3, 'Diaria', 36000],
    ['2026-12-11T10:00', 10, 'Semanal', 95000],
    ['2027-01-05T10:00', 35, 'Mensual', 291668],
  ]) {
    const estimate = estimateRental(rates, pickup, dropoff, now);
    assert.equal(estimate.days, days);
    assert.equal(estimate.tier, tier);
    assert.equal(estimate.total, total);
    assert.equal(estimate.deposit, 80000);
  }
});

test('una fracción de día cruza el límite de tramo y el precio de partida lo explica', () => {
  const estimate = estimateRental(rates, pickup, '2026-12-07T10:01', now);
  assert.equal(estimate.days, 7);
  assert.equal(estimate.total, 7 * rates.weeklyPerDay);
  assert.deepEqual(startingRentalRate(rates), { centsPerDay: 8333, term: 'Desde 30 días · equivalente diario' });
});

test('no inventa tarifas para tramos ausentes y rechaza fechas inválidas', () => {
  assert.equal(estimateRental({ ...rates, monthly: null }, pickup, '2027-01-05T10:00', now).total, null);
  assert.throws(() => estimateRental(rates, pickup, pickup, now), /posterior/);
  assert.throws(() => estimateRental(rates, pickup, '2027-02-30T10:00', now), /válidas/);
  assert.throws(() => estimateRental(rates, '2026-12-01T09:59', '2026-12-04T10:00', now), /actual/);
});

test('una campaña aplica al recojo dentro de su vigencia y suma extras sin incluir garantía', () => {
  const promotion = { id:'promo', vehicleId:'modelo', title:'Campaña', banner:'', terms:'Bases', starts:'2026-12-01', ends:'2026-12-10', cents:9000, regularCents:12000, published:true };
  const extra = { id:'extra', name:'Accesorio', cents:1000, active:true };
  const estimate = estimateRental(rates, pickup, '2026-12-11T10:00', now, { promotion, extras:[extra] });
  assert.equal(estimate.tier, 'Promocional');
  assert.equal(estimate.total, 100000);
  assert.equal(estimate.extrasTotal, 10000);
  assert.equal(estimate.deposit, 80000);
  const after = estimateRental(rates, '2026-12-11T10:00', '2026-12-21T10:00', now, { promotion });
  assert.equal(after.total, 95000);
});

test('combina descuentos solo cuando está habilitado y conserva el prorrateo configurable', () => {
  const promotion = { id:'promo', vehicleId:'modelo', title:'Campaña', banner:'', terms:'Bases', starts:'2026-12-01', ends:'2026-12-10', cents:9000, regularCents:12000, published:true };
  const rules = { ...defaultRentalRules, monthlyFrom:28, monthlyDivisor:28, stackPromotion:true };
  const estimate = estimateRental({ ...rates, monthly:280000 }, pickup, '2026-12-29T10:00', now, { rules, promotion });
  assert.equal(estimate.days, 28);
  assert.equal(estimate.tier, 'Mensual con promoción');
  assert.equal(estimate.total, 210000);
});

test('revisión y guardado de categoría usan una única operación para todos los modelos', async () => {
  const input = {
    campaignId: '7386a605-4ed4-4fe2-a7ea-46e96811073a',
    category: 'SUV', vehicleIds: ['modelo-a', 'modelo-b'], title: 'Campaña SUV', banner: '',
    starts: '2026-12-01', ends: '2026-12-10', cents: 9000, terms: 'Bases de prueba', published: true,
  };
  const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
  const calls = [];
  const rest = async (path, options) => {
    calls.push([path, options.method, JSON.parse(options.body)]);
    return input.vehicleIds.map(id => ({ id, reason: null }));
  };
  for (const preview of [true, false]) {
    const checks = await saveCommercial('rental-promotion', { ...input, preview }, rest, fail);
    assert.equal(checks.length, 2);
  }
  assert.deepEqual(calls, [true, false].map(simular => [
    'rpc/guardar_promocion_categoria', 'POST', { ficha: input, simular },
  ]));
  await assert.rejects(
    saveCommercial('rental-promotion', { ...input, vehicleIds: ['modelo-a', 'modelo-a'], preview: false }, rest, fail),
    { status: 400 },
  );
  assert.equal(calls.length, 2);
});
