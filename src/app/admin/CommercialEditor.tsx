'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Listing } from '@/lib/marketing';
import { formatSoles, type CommercialCatalog } from '@/lib/rental-pricing.mjs';
import ActionDialog, { type EditorAction } from './ActionDialog';
import { SaveToast } from './Feedback';

type Api = (path: string, body?: BodyInit) => Promise<string>;
const modes = [['rental-rules','Tramos'], ['rental-extra','Extras'], ['rental-promotion','Promociones'], ['service-rate','Tarifas de servicios']] as const;
const serviceNames: Record<string, string> = { empresas:'Empresas', 'excavadora-cat-330dl':'Excavadora CAT 330DL', volquetes:'Volquetes' };
type Mode = typeof modes[number][0];
type PromotionCheck = { id: string; name: string; reason: string | null };

export default function CommercialEditor({ api, vehicles, onDirtyChange }: {
  api: Api; vehicles: Listing[]; onDirtyChange: (dirty: boolean) => void;
}) {
  const [catalog, setCatalog] = useState<CommercialCatalog>();
  const [mode, setMode] = useState<Mode>('rental-rules');
  const [id, setId] = useState('');
  const [revision, setRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [action, setAction] = useState<EditorAction>();
  const [message, setMessage] = useState('');
  const [scope, setScope] = useState('vehicle');
  const [category, setCategory] = useState('');
  const [checks, setChecks] = useState<PromotionCheck[]>([]);
  const [checking, setChecking] = useState(false);
  const draftCampaignId = useRef('');
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => {
    let active = true;
    api('commercial-admin').then(value => { if (active) setCatalog(JSON.parse(value)); })
      .catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [api]);

  if (!catalog) return <p role="status">{message || 'Cargando condiciones comerciales…'}</p>;
  const { rules, promotions, extras, services } = catalog;
  const promotion = promotions.find(item => (item.campaignId ?? item.id) === id);
  const byCategory = Boolean(promotion?.campaignId || (!promotion && scope === 'category'));
  const published = vehicles.filter(vehicle => vehicle.published !== false);
  const categories = [...new Set(published.flatMap(vehicle => [vehicle.category, ...(vehicle.additionalCategories ?? [])]))]
    .sort((a, b) => a.localeCompare(b, 'es'));
  const categoryVehicleIds = promotion?.campaignId
    ? promotions.filter(item => item.campaignId === promotion.campaignId).map(item => item.vehicleId)
    : published.filter(vehicle => vehicle.category === category || vehicle.additionalCategories?.includes(category)).map(vehicle => vehicle.id);
  const categoryVehicles = vehicles.filter(vehicle => categoryVehicleIds.includes(vehicle.id));
  const extra = extras.find(item => item.id === id);
  const service = services?.find(item => item.id === id) ?? services?.[0];

  function resetPromotion() {
    setScope('vehicle');
    setCategory('');
    setChecks([]);
    draftCampaignId.current = '';
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? '').trim();
    const cents = Math.round(Number(value('price')) * 100);
    const preview = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'preview';
    let categoryInput: { campaignId: string; category: string; vehicleIds: string[]; preview: boolean } | undefined;
    if (mode === 'rental-promotion' && byCategory) {
      if (!categoryVehicleIds.length) return;
      const campaignId = promotion?.campaignId || (draftCampaignId.current ||= crypto.randomUUID());
      categoryInput = { campaignId, category: promotion?.category ?? category, vehicleIds: categoryVehicleIds, preview };
    }
    const input = mode === 'rental-rules' ? {
      weeklyFrom: Number(value('weekly')), monthlyFrom: Number(value('monthly')),
      monthlyDivisor: Number(value('divisor')), stackPromotion: form.has('stack'),
    } : mode === 'service-rate' ? {
      id: service?.id, cents: value('price') ? cents : null, unit: value('unit'),
    } : mode === 'rental-extra' ? {
      id, name: value('name'), cents, active: form.has('active'),
    } : {
      id, title: value('name'), vehicleId: value('vehicle'), starts: value('starts'), ends: value('ends'),
      cents, banner: value('banner'), terms: value('terms'), published: form.has('published'),
      ...categoryInput,
    };
    if (preview) {
      setChecking(true);
      setChecks([]);
      setMessage('');
      try { setChecks(JSON.parse(await api(mode, JSON.stringify(input)))); }
      catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo revisar la campaña.'); }
      finally { setChecking(false); }
      return;
    }
    setAction({
      title: categoryInput ? '¿Guardar campaña por categoría?' : '¿Guardar condiciones comerciales?',
      detail: categoryInput
        ? `La campaña incluye ${categoryVehicleIds.length} vehículos de ${categoryInput.category}.`
        : 'El cotizador usará la configuración guardada para calcular los nuevos importes.',
      label: 'Guardar cambios',
      apply: async () => {
        await api(mode, JSON.stringify(input));
        setCatalog(JSON.parse(await api('commercial-admin')));
        if (categoryInput) setId(categoryInput.campaignId);
        resetPromotion();
        setDirty(false);
        setRevision(current => current + 1);
        window.dispatchEvent(new Event('marketing-saved'));
        setMessage('Condiciones comerciales guardadas.');
      },
    });
  }

  async function downloadHistory() {
    try {
      const records: Record<string, unknown>[] = JSON.parse(await api('rental-history'));
      const csv = (value: unknown) => {
        const raw = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
        const safe = /^[=+\-@\t\r\n]/.test(raw) ? `'${raw}` : raw;
        return `"${safe.replaceAll('"', '""')}"`;
      };
      const content = ['Tipo;Vehículo;Fecha;Usuario;Anterior (céntimos);Nuevo (céntimos)',
        ...records.map(row => [row.tipo, row.vehiculo_id, row.cambiado_en, row.autor, row.anterior, row.nueva].map(csv).join(';'))].join('\r\n');
      const url = URL.createObjectURL(new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'historial-tarifas.csv';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo exportar el historial.');
    }
  }

  return <>
    <SaveToast message={message} busy={false}/>
    {action && <ActionDialog action={action} dismiss={() => setAction(undefined)}/>}
    <form key={`${mode}:${id}:${revision}`} onSubmit={submit} onChange={event => {
      if (event.target.getAttribute('name')) { setDirty(true); setMessage(''); setChecks([]); }
    }}><fieldset disabled={checking}><section>
      <div className="rate-admin-grid">
        <label>Configuración<select value={mode} disabled={dirty} onChange={event => { setMode(event.target.value as Mode); setId(''); resetPromotion(); }}>
          {modes.map(([value, title]) => <option key={value} value={value}>{title}</option>)}
        </select></label>
        {(mode === 'rental-extra' || mode === 'rental-promotion') && <label>Registro<select value={id} disabled={dirty} onChange={event => { setId(event.target.value); resetPromotion(); }}>
          <option value="">Crear nuevo</option>
          {(mode === 'rental-extra' ? extras.map(item => ({ id: item.id, label: item.name })) :
            [...new Map(promotions.map(item => [item.campaignId ?? item.id, {
              id: item.campaignId ?? item.id,
              label: `${item.title} · ${item.category ?? vehicles.find(vehicle => vehicle.id === item.vehicleId)?.name ?? item.vehicleId}`,
            }])).values()])
            .map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select></label>}
        {mode === 'service-rate' && <label>Servicio<select value={service?.id ?? ''} disabled={dirty} onChange={event => setId(event.target.value)}>
          {services?.map(item => <option key={item.id} value={item.id}>{serviceNames[item.id]}</option>)}
        </select></label>}
      </div>
      {mode === 'rental-rules' && <>
        <div className="rate-admin-grid">
          <label>Tramo semanal desde (días)<input name="weekly" type="number" min={2} max={90} defaultValue={rules.weeklyFrom} required/></label>
          <label>Tramo mensual desde (días)<input name="monthly" type="number" min={3} max={180} defaultValue={rules.monthlyFrom} required/></label>
          <label>Días para prorratear el mes<input name="divisor" type="number" min={1} max={366} defaultValue={rules.monthlyDivisor} required/></label>
        </div>
        <label className="check"><input name="stack" type="checkbox" defaultChecked={rules.stackPromotion}/>Aplicar el porcentaje promocional también a la tarifa por duración</label>
      </>}
      {mode === 'service-rate' && <div className="rate-admin-grid">
        <label>Precio desde (S/ con IGV)<input name="price" type="number" min={0.01} max={1000000} step="0.01"
          defaultValue={service?.cents == null ? '' : service.cents / 100}/></label>
        <label>Unidad de cobro<input name="unit" maxLength={40} defaultValue={service?.unit} placeholder="Ej. mes"/></label>
      </div>}
      {(mode === 'rental-extra' || mode === 'rental-promotion') && <div className="rate-admin-grid">
        <label>Nombre<input name="name" maxLength={100} defaultValue={extra?.name ?? promotion?.title ?? ''} required/></label>
        <label>Precio diario en soles (IGV incluido)<input name="price" type="number" step="0.01" min={mode === 'rental-extra' ? 0 : 0.01} max={1000000}
          defaultValue={(extra?.cents ?? promotion?.cents) == null ? '' : (extra?.cents ?? promotion?.cents ?? 0) / 100} required/></label>
      </div>}
      {mode === 'rental-extra' && <label className="check"><input name="active" type="checkbox" defaultChecked={extra?.active}/>Disponible en el cotizador</label>}
      {mode === 'rental-promotion' && <>
        <div className="rate-admin-grid">
          {!promotion && <label>Aplicar a<select name="scope" value={scope} onChange={event => setScope(event.target.value)}>
            <option value="vehicle">Un vehículo</option><option value="category">Una categoría</option>
          </select></label>}
          {byCategory ? <label key="category">Categoría<select name="category" value={promotion?.category ?? category}
            disabled={Boolean(promotion)} onChange={event => { draftCampaignId.current = ''; setCategory(event.target.value); }} required>
            <option value="">Elija una categoría</option>
            {(promotion?.category ? [promotion.category] : categories).map(name => <option key={name}>{name}</option>)}
          </select></label> : <label key="vehicle">Vehículo<select name="vehicle" defaultValue={promotion?.vehicleId ?? ''} required><option value="">Elija un modelo</option>
            {vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}
          </select></label>}
          <label>Inicio<input name="starts" type="date" defaultValue={promotion?.starts} required/></label>
          <label>Fin<input name="ends" type="date" defaultValue={promotion?.ends} required/></label>
        </div>
        <label>Texto de la cinta<input name="banner" maxLength={200} defaultValue={promotion?.banner}/></label>
        <label>Bases de la campaña<textarea name="terms" maxLength={4000} defaultValue={promotion?.terms} required/></label>
        <label className="check"><input name="published" type="checkbox" defaultChecked={promotion?.published}/>Publicar en las fechas indicadas</label>
        <p>La publicación requiere historial suficiente del precio regular y una vigencia sin solapamientos.</p>
        {byCategory && categoryVehicles.length > 0 && <div className="rate-admin-campaign">
          <h3>Vehículos incluidos ({categoryVehicles.length})</h3>
          {!promotion && <p>La lista queda fijada al guardar la campaña.</p>}
          <ul>{categoryVehicles.map(vehicle => {
            const check = checks.find(item => item.id === vehicle.id);
            const rate = vehicle.rates?.daily;
            return <li key={vehicle.id}><strong>{vehicle.name}</strong> · {rate == null ? 'Sin tarifa diaria' : `Tarifa diaria ${formatSoles(rate)}`}
              {check && <span> · {check.reason ?? 'Puede publicar'}</span>}</li>;
          })}</ul>
          <p role="status">{checking ? 'Comprobando tarifas y vigencias…' : checks.length > 0 &&
            `${checks.filter(check => check.reason === null).length} de ${checks.length} vehículos cumplen las condiciones.`}</p>
        </div>}
      </>}
      <div className="actions"><button className="gold" type="submit" disabled={!dirty}>Guardar cambios</button>
        {mode === 'rental-promotion' && byCategory && categoryVehicles.length > 0 &&
          <button type="submit" value="preview">{checking ? 'Revisando…' : 'Revisar vehículos para publicar'}</button>}
        <button type="button" disabled={!dirty} onClick={() => { setDirty(false); resetPromotion(); setRevision(current => current + 1); }}>Descartar cambios</button>
        {mode === 'rental-rules' && <button type="button" onClick={() => void downloadHistory()}>Exportar historial para Excel</button>}
      </div>
    </section></fieldset></form>
  </>;
}
