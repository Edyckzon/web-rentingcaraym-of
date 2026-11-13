'use client';

import { useEffect, useState } from 'react';
import ActionDialog, { type EditorAction } from './ActionDialog';
import { SaveToast } from './Feedback';
import FreightPreview, { type FreightRoute } from './FreightPreview';

type Api = (path: string, body?: BodyInit) => Promise<string>;

export default function FreightDraft({ api, onDirtyChange }: { api: Api; onDirtyChange: (dirty: boolean) => void }) {
  const [routes, setRoutes] = useState<FreightRoute[]>();
  const [selected, setSelected] = useState('');
  const [dirty, setDirty] = useState(false);
  const [revision, setRevision] = useState(0);
  const [action, setAction] = useState<EditorAction>();
  const [message, setMessage] = useState('');
  const current = routes?.find(route => route.id === selected);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => {
    let active = true;
    api('freight-draft').then(raw => { if (active) setRoutes(JSON.parse(raw)); })
      .catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [api]);
  if (!routes) return <p role="status">{message || 'Cargando rutas…'}</p>;
  return <>
    <SaveToast message={message} busy={false}/>
    {action && <ActionDialog action={action} dismiss={() => setAction(undefined)}/>}
    <form key={`${selected}:${revision}`} onChange={event => { if (event.target.getAttribute('name')) setDirty(true); }} onSubmit={event => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      const price = fields.get('price');
      setAction({ title: '¿Guardar esta ruta en borrador?', detail: 'La ruta se podrá revisar desde el administrador.', label:'Guardar borrador', apply: async () => {
        const saved: FreightRoute = JSON.parse(await api('freight-draft', JSON.stringify({
          id: selected, origin:fields.get('origin'), destination:fields.get('destination'), description:fields.get('description'),
          duration:fields.get('duration'), cents:price === '' ? null : Math.round(Number(price) * 100),
        })));
        setRoutes(JSON.parse(await api('freight-draft')));
        setSelected(saved.id);
        setDirty(false);
        setRevision(value => value + 1);
        setMessage('Ruta guardada en borrador.');
      }});
    }}><fieldset><section>
      <label>Ruta<select value={selected} disabled={dirty} onChange={event => setSelected(event.target.value)}>
        <option value="">Crear nueva ruta</option>{routes.map(route => <option key={route.id} value={route.id}>{route.origen} → {route.destino}</option>)}
      </select></label>
      <div className="rate-admin-grid">
        <label>Origen<input name="origin" maxLength={100} defaultValue={current?.origen} required/></label>
        <label>Destino<input name="destination" maxLength={100} defaultValue={current?.destino} required/></label>
        <label>Tiempo estimado<input name="duration" maxLength={100} defaultValue={current?.tiempo_estimado}/></label>
        <label>Precio desde (S/ por viaje)<input name="price" type="number" step="0.01" min={0.01} max={1000000}
          defaultValue={current?.precio_centimos == null ? '' : current.precio_centimos / 100}/></label>
      </div>
      <label>Descripción<textarea name="description" maxLength={4000} defaultValue={current?.descripcion}/></label>
      <div className="actions"><button className="gold" type="submit" disabled={!dirty}>Guardar borrador</button>
        <button type="button" disabled={!dirty} onClick={() => { setDirty(false); setRevision(value => value + 1); }}>Descartar cambios</button></div>
    </section></fieldset></form>
    <FreightPreview key={selected} routes={routes} initialRoute={selected}/>
  </>;
}
