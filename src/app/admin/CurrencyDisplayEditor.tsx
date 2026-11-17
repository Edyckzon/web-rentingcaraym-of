'use client';

import { useEffect, useState } from 'react';
import { useCommercial } from '@/components/MarketingProvider';
import { limaDate, type PriceDisplay } from '@/lib/rental-pricing.mjs';
import ActionDialog, { type EditorAction } from './ActionDialog';

export default function CurrencyDisplayEditor({api,onDirtyChange}: {api:(path:string,body?:BodyInit)=>Promise<string>;onDirtyChange:(dirty:boolean)=>void}) {
  const catalog=useCommercial();
  const [saved,setSaved]=useState<PriceDisplay>();
  const [draft,setDraft]=useState<PriceDisplay>();
  const [action,setAction]=useState<EditorAction>();
  const [message,setMessage]=useState('');
  useEffect(()=>{ if(catalog?.priceDisplay && !saved){setSaved(catalog.priceDisplay);setDraft(catalog.priceDisplay);} },[catalog,saved]);
  const dirty=Boolean(draft && JSON.stringify(draft)!==JSON.stringify(saved));
  useEffect(()=>onDirtyChange(dirty),[dirty,onDirtyChange]);
  if(!draft)return <p>Cargando opciones de monedas…</p>;
  const change=(patch:Partial<PriceDisplay>)=>{setDraft({...draft,...patch});setMessage('');};
  return <section className="currency-display-admin">
    <h2>Precios en soles y dólares</h2>
    <p>Cada tarifa permite digitar ambos precios o calcular el segundo con un tipo de cambio. El precio principal se usa en el cotizador.</p>
    <form onSubmit={event=>{event.preventDefault();setAction({title:'¿Guardar visualización de monedas?',detail:'Se actualizará cómo aparecen los precios en la web.',label:'Guardar configuración',apply:async()=>{
      await api('rental-display',JSON.stringify(draft));setSaved(draft);window.dispatchEvent(new Event('marketing-saved'));setMessage('Configuración de monedas guardada.');
    }});}}>
      <label className="check"><input type="checkbox" checked={draft.enabled} onChange={event=>change({enabled:event.target.checked})}/>Mostrar ambos precios en la web</label>
      <label className="check"><input type="checkbox" checked={draft.showRate} onChange={event=>change({showRate:event.target.checked})}/>Mostrar el tipo de cambio y su fecha en la web</label>
      <div className="rate-admin-grid"><label>TC para los precios calculados<select value={draft.source} onChange={event=>change({source:event.target.value as PriceDisplay['source']})}>
        <option value="bcrp">Automático · BCRP (venta)</option><option value="manual">Tipo de cambio manual</option></select></label>
        {draft.source==='manual' && <><label>Soles por US$ 1<input type="number" min="0.1" max="100" step="0.0001" required value={draft.manualRate ?? ''} onChange={event=>change({manualRate:event.target.value ? Number(event.target.value):null})}/></label>
          <label>Fecha del TC<input type="date" max={limaDate()} required value={draft.manualDate ?? ''} onChange={event=>change({manualDate:event.target.value})}/></label></>}
      </div>
      <p>Los precios digitados se mantienen fijos. Los calculados se actualizan con el TC seleccionado y aparecen con ≈. Si la referencia automática no está disponible, se muestra «Equivalente por confirmar».</p>
      <div className="actions"><button type="submit" className="gold" disabled={!dirty}>Guardar configuración</button><button type="button" disabled={!dirty} onClick={()=>{setDraft(saved);setMessage('');}}>Descartar cambios</button></div>
      {message && <p role="status">{message}</p>}
    </form>
    {action && <ActionDialog action={action} dismiss={()=>setAction(undefined)}/>}
  </section>;
}
