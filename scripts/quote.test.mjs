import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';

// Compile the pure quote logic in memory; no extra test dependencies needed.
const source = await readFile(new URL('../src/lib/quote.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { buildQuote, serviceOptions, todayInLima } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

function request(overrides = {}) {
  const values = { service: 'vehiculos', model: 'Ford Territory', name: 'Consulta de prueba', phone: '+51 999 000 111', start: todayInLima(), duration: '3 días', location: 'Surco', consent: 'on', ...overrides };
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

test('all five service types produce an accurate message; only cars include a model', () => {
  for (const { value, label } of serviceOptions) {
    const text = buildQuote(request({ service: value, destination: 'Destino de prueba' }));
    assert.ok(text.includes(`Servicio: ${label}`));
    assert.equal(text.includes('Modelo: Ford Territory'), value === 'vehiculos');
    assert.equal(text.includes('Destino: Destino de prueba'), value === 'transporte-de-carga');
    assert.ok(text.includes('Autorizo el uso de estos datos'));
  }
});
test('natural persons can quote without company, RUC or email', () => {
  const text = buildQuote(request());
  assert.ok(!text.includes('Empresa:'));
  assert.ok(!text.includes('RUC:'));
  assert.ok(!text.includes('Correo:'));
});
test('incomplete, past, invalid or unconsented requests are rejected', () => {
  for (const overrides of [{ service: 'invalid' }, { phone: 'abc' }, { ruc: '123' }, { start: '2020-01-01' }, { start: '' }, { consent: '' }, { location: '   ' }, { duration: '' }, { name: '' }, { service: 'transporte-de-carga', destination: '' }]) {
    assert.throws(() => buildQuote(request(overrides)), Error);
  }
});
test('Spanish text, line breaks and symbols survive WhatsApp URL encoding', () => {
  const text = buildQuote(request({ message: 'Carga A&M: 2 m³\nRecojo en Perú #1' }));
  const url = new URL(`https://wa.me/51993334984?text=${encodeURIComponent(text)}`);
  assert.equal(url.searchParams.get('text'), text);
});
