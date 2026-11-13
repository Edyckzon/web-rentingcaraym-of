'use client';

import { useState, type FormEvent } from 'react';
import { formatSoles, limaDate } from '@/lib/rental-pricing.mjs';

export type FreightRoute = {
  id: string;
  origen: string;
  destino: string;
  descripcion: string;
  tiempo_estimado: string;
  precio_centimos: number | null;
};

function routePrice(route: FreightRoute) {
  return route.precio_centimos === null ? 'Tarifa a consultar' : `Desde ${formatSoles(route.precio_centimos)} por viaje`;
}

export default function FreightPreview({ routes, initialRoute }: { routes: FreightRoute[]; initialRoute: string }) {
  const [routeId, setRouteId] = useState(initialRoute);
  const route = routes.find(item => item.id === routeId);

  return <section aria-labelledby="freight-preview-title">
    <h2 id="freight-preview-title">Vista previa de carga nacional</h2>
    <label>Página a revisar<select value={routeId} onChange={event => setRouteId(event.target.value)}>
      <option value="">Vista general</option>
      {routes.map(item => <option key={item.id} value={item.id}>{item.origen} → {item.destino}</option>)}
    </select></label>
    {route ? <article>
      <h3>Transporte de carga {route.origen} – {route.destino}</h3>
      {route.descripcion && <p className="promotion-terms">{route.descripcion}</p>}
      <p>{routePrice(route)}{route.tiempo_estimado && ` · ${route.tiempo_estimado}`}</p>
    </article> : <article>
      <h3>Transporte de carga a nivel nacional desde Lima</h3>
      <p>Indique la ruta, el tipo de carga, el peso y la fecha para preparar una solicitud de cotización.</p>
      <h4>Rutas frecuentes</h4>
      {routes.length ? <ul>{routes.map(item => <li key={item.id}>
        <button type="button" onClick={() => setRouteId(item.id)}>{item.origen} → {item.destino}</button>
        <span> · {routePrice(item)}{item.tiempo_estimado && ` · ${item.tiempo_estimado}`}</span>
      </li>)}</ul> : <p>Las rutas que guardes arriba aparecerán aquí.</p>}
    </article>}
    <FreightQuotePreview key={routeId} routes={routes} route={route}/>
  </section>;
}

function FreightQuotePreview({ routes, route }: { routes: FreightRoute[]; route?: FreightRoute }) {
  const [destination, setDestination] = useState(route?.id ?? '');
  const [message, setMessage] = useState('');

  function prepareMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = (key: string) => String(fields.get(key) ?? '').trim();
    const selectedRoute = routes.find(item => item.id === destination);
    const company = [value('company'), value('ruc')].filter(Boolean).join(' / ');
    setMessage([
      'Hola Renting Car A&M, quiero cotizar un flete:',
      `Ruta: ${value('origin')} → ${selectedRoute?.destino ?? value('otherDestination')}`,
      `Carga: ${value('cargo')}, ${value('weight')} t aprox.`,
      `Dimensiones o volumen: ${value('dimensions') || 'Por confirmar'}`,
      `Fecha de carga: ${value('date').split('-').reverse().join('/')}`,
      `Carga y descarga: ${fields.has('handling') ? 'Sí' : 'No'} · Seguro de carga: ${fields.has('insurance') ? 'Sí' : 'No'}`,
      `Empresa / RUC: ${company}`,
    ].join('\n'));
  }

  return <form onSubmit={prepareMessage} onChange={() => setMessage('')}>
    <h3>Cotizador de flete</h3>
    <div className="rate-admin-grid">
      <label>Origen<input name="origin" maxLength={100} defaultValue={route?.origen ?? 'Lima'} required/></label>
      <label>Destino<select value={destination} required onChange={event => setDestination(event.target.value)}>
        <option value="">Elija un destino</option>
        {routes.map(item => <option key={item.id} value={item.id}>{item.destino} · desde {item.origen}</option>)}
        <option value="other">Otro destino</option>
      </select></label>
      {destination === 'other' && <label>Indique el destino<input name="otherDestination" maxLength={100} required/></label>}
      <label>Tipo de carga<input name="cargo" maxLength={100} required/></label>
      <label>Peso aproximado (t)<input name="weight" type="number" min={0.01} step="0.01" required/></label>
      <label>Dimensiones o volumen<input name="dimensions" maxLength={120}/></label>
      <label>Fecha de carga<input name="date" type="date" min={limaDate()} required/></label>
      <label>Empresa<input name="company" maxLength={100}/></label>
      <label>RUC (opcional)<input name="ruc" inputMode="numeric" pattern="[0-9]{11}" maxLength={11}/></label>
    </div>
    <label className="check"><input name="handling" type="checkbox"/>Requiere carga y descarga</label>
    <label className="check"><input name="insurance" type="checkbox"/>Requiere seguro de carga</label>
    <button type="submit">Preparar mensaje de muestra</button>
    {message && <p className="promotion-terms" role="status">{message}</p>}
  </form>;
}
