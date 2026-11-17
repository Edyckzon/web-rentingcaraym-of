'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import { Pencil, Plus } from 'lucide-react';
import type { Listing } from '@/lib/marketing';
import { defaultRentalRules, emptyRentalRates, formatMoney, rateCurrency, type Currency, type RateKey, type RentalRates, type RentalRules } from '@/lib/rental-pricing.mjs';
import ExchangeRate from '@/components/ExchangeRate';

import { useCommercial } from '@/components/MarketingProvider';

function priceInput(cents: number | null) {
  return cents === null ? '' : (cents / 100).toFixed(2);
}

function parsePrice(value: string, field: RateKey) {
  const amount = value.trim().replace(',', '.');
  if (!amount) return null;
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(amount)) throw new Error('Use un monto con hasta dos decimales.');
  const [whole, fraction = ''] = amount.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (cents > 100000000 || (field !== 'deposit' && cents === 0)) throw new Error('Indique un importe válido. Las tarifas deben ser mayores que cero.');
  return cents;
}

const filters = [
  { id: 'all', label: 'Todos' },
  { id: 'missing', label: 'Sin tarifas' },
  { id: 'partial', label: 'Parciales' },
  { id: 'complete', label: 'Completas' },
] as const;
const priority = { partial: 0, missing: 1, complete: 2 };
const stateLabels = { missing: 'Sin tarifas', partial: 'Parcial', complete: 'Completa' };
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

function rateState(rates?: RentalRates): keyof typeof stateLabels {
  const count = [rates?.daily, rates?.weeklyPerDay, rates?.monthly].filter(value => value != null).length;
  return count === 3 ? 'complete' : count === 0 ? 'missing' : 'partial';
}

export default function RateEditor({ vehicles, onDirtyChange, onSave }: {
  vehicles: Listing[];
  onDirtyChange: (dirty: boolean) => void;
  onSave: (vehicle: Listing, rates: RentalRates) => void;
}) {
  const rules = useCommercial()?.rules ?? defaultRentalRules;
  const [selected, setSelected] = useState('');
  const [filter, setFilter] = useState<typeof filters[number]['id']>('all');
  const [query, setQuery] = useState('');
  const [dirty, setDirty] = useState(false);
  const editTitle = useRef<HTMLHeadingElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const searchBox = useRef<HTMLInputElement>(null);
  const vehicle = vehicles.find(item => item.id === selected);
  const reportDirty = useCallback((value: boolean) => {
    setDirty(value);
    onDirtyChange(value);
  }, [onDirtyChange]);

  useEffect(() => { if (selected) editTitle.current?.focus(); }, [selected]);

  if (!vehicles.length) return <p>Agregue un vehículo para configurar sus tarifas.</p>;
  const rows = vehicles.map(item => ({ item, state: rateState(item.rates) }));
  const counts = { all: rows.length, missing: 0, partial: 0, complete: 0 };
  for (const row of rows) counts[row.state]++;
  const search = normalize(query);
  const visible = rows.filter(({ item, state }) => (filter === 'all' || filter === state) && normalize(item.name).includes(search))
    .sort((a, b) => priority[a.state] - priority[b.state] || a.item.name.localeCompare(b.item.name, 'es'));
  const amount = (rates: RentalRates | undefined, key: RateKey) => rates?.[key] == null ? <span className="rate-admin-unset" aria-label="Sin importe">—</span> : formatMoney(rates[key], rateCurrency(rates, key));

  return <div className="rate-admin-workspace">
    <section className="rate-admin-overview" aria-labelledby="rate-admin-overview-title">
      <h2 id="rate-admin-overview-title">Tarifas por vehículo</h2>
      <ExchangeRate/>
      <div className="rate-admin-toolbar">
        <div className="rate-admin-filters" role="group" aria-label="Filtrar por estado de tarifa">
          {filters.map(item => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>
            {item.label} <span>{counts[item.id]}</span>
          </button>)}
        </div>
        <input ref={searchBox} type="search" aria-label="Buscar vehículo por modelo" placeholder="Buscar modelo…" value={query} onChange={event => setQuery(event.target.value)}/>
      </div>
      {dirty && <p className="rate-admin-pending" role="status">Guarda o descarta los cambios para editar otro vehículo.</p>}
      <div className="rate-admin-scroll" role="region" aria-label="Importes guardados por vehículo" tabIndex={0}>
        <table className="rate-admin-table">
          <thead><tr><th scope="col">Vehículo</th><th scope="col">Estado</th>
            <th className="rate-admin-money" scope="col">Diaria</th><th className="rate-admin-money" scope="col">Semanal / día</th>
            <th className="rate-admin-money" scope="col">Mensual</th><th className="rate-admin-money" scope="col">Garantía</th><th scope="col">Acción</th></tr></thead>
          <tbody>{visible.map(({ item, state }) => <tr key={item.id} data-editing={selected === item.id}>
            <th scope="row">{item.name}{item.published === false && <span className="rate-admin-draft">Borrador</span>}</th>
            <td><span className="rate-admin-badge" data-state={state}>{stateLabels[state]}</span></td>
            <td className="rate-admin-money">{amount(item.rates, 'daily')}</td><td className="rate-admin-money">{amount(item.rates, 'weeklyPerDay')}</td>
            <td className="rate-admin-money">{amount(item.rates, 'monthly')}</td><td className="rate-admin-money">{amount(item.rates, 'deposit')}</td>
            <td><button type="button" className="rate-admin-edit" disabled={dirty && selected !== item.id}
              aria-label={`${state === 'missing' ? 'Agregar tarifas a' : 'Editar tarifas de'} ${item.name}`}
              onClick={event => {
                editButton.current = event.currentTarget;
                if (selected === item.id) editTitle.current?.focus();
                else setSelected(item.id);
              }}>{state === 'missing' ? <Plus size={15} aria-hidden="true"/> : <Pencil size={14} aria-hidden="true"/>}
              {state === 'missing' ? 'Agregar' : 'Editar'}</button></td>
          </tr>)}</tbody>
        </table>
        {visible.length === 0 && <p className="rate-admin-empty" role="status">No hay vehículos con esos filtros.</p>}
      </div>
    </section>
    {vehicle && <RateForm key={`${vehicle.id}:${JSON.stringify(vehicle.rates)}`} vehicle={vehicle} rules={rules} editTitle={editTitle}
      onClose={() => { setSelected(''); (editButton.current?.isConnected ? editButton.current : searchBox.current)?.focus(); }} onDirtyChange={reportDirty} onSave={onSave}/>}
  </div>;
}

function RateForm({ vehicle, rules, editTitle, onClose, onDirtyChange, onSave }: {
  vehicle: Listing;
  rules: RentalRules;
  editTitle: RefObject<HTMLHeadingElement | null>;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onSave: (vehicle: Listing, rates: RentalRates) => void;
}) {
  const { weeklyFrom, monthlyFrom } = rules;
  const fields = [
    ['daily', `Tarifa por día · 1 a ${weeklyFrom - 1} días`],
    ['weeklyPerDay', `Tarifa por día · ${weeklyFrom} a ${monthlyFrom - 1} días`],
    ['monthly', `Tarifa por mes · desde ${monthlyFrom} días`],
    ['deposit', 'Garantía aparte'],
  ] as const;
  const saved = vehicle.rates ?? emptyRentalRates;
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(([key]) => [key, priceInput(saved[key])])));
  const savedCurrencies = () => Object.fromEntries(fields.map(([key]) => [key, rateCurrency(saved, key)])) as Record<RateKey, Currency>;
  const [currencies, setCurrencies] = useState(savedCurrencies);
  const [error, setError] = useState('');
  const dirty = fields.some(([key]) => {
    try { return parsePrice(values[key], key) !== saved[key] || currencies[key] !== rateCurrency(saved, key); }
    catch { return true; }
  });

  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const rates: RentalRates = { ...emptyRentalRates, currencies };
    for (const [key, label] of fields) {
      try { rates[key] = parsePrice(values[key], key); }
      catch (error) {
        setError(`${label}. ${error instanceof Error ? error.message : 'Revise el importe.'}`);
        event.currentTarget.querySelector<HTMLInputElement>(`input[name="${key}"]`)?.focus();
        return;
      }
    }
    onSave(vehicle, rates);
  }

  return <form onSubmit={submit}><fieldset><section>
    <div className="rate-admin-form-head"><h2 ref={editTitle} tabIndex={-1}>Tarifas de {vehicle.name}</h2>
      <button type="button" disabled={dirty} onClick={onClose}>Cerrar edición</button></div>
    <p>Elija la moneda de cada importe con IGV incluido. Puede combinar tarifas en soles y dólares. Cambiar la moneda conserva el número ingresado; no lo convierte.</p>
    <p>Deje un importe vacío cuando deba consultarse.</p>
    <div className="rate-admin-grid">{fields.map(([key, label]) => <div key={key}><label>{label}
      <input name={key} inputMode="decimal" maxLength={10} value={values[key]} onChange={event => {
        setValues(current => ({ ...current, [key]: event.target.value }));
        setError('');
      }}/>
    </label><label>Moneda · {label}<select name={`${key}Currency`} value={currencies[key]} onChange={event => {
      setCurrencies(current => ({ ...current, [key]: event.target.value as Currency })); setError('');
    }}><option value="PEN">Soles (S/ · PEN)</option><option value="USD">Dólares (US$ · USD)</option></select></label></div>)}</div>
    {error && <p role="alert">{error}</p>}
    <div className="actions"><button type="submit" className="gold" disabled={!dirty}>Guardar tarifas</button>
      <button type="button" disabled={!dirty} onClick={() => {
        setValues(Object.fromEntries(fields.map(([key]) => [key, priceInput(saved[key])])));
        setCurrencies(savedCurrencies());
        setError('');
      }}>Descartar cambios</button></div>
  </section></fieldset></form>;
}
