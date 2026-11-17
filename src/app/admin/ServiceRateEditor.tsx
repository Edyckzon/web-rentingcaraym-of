'use client';
import {useEffect,useState} from 'react';
import type {CommercialCatalog,ServiceRate,Currency} from '@/lib/rental-pricing.mjs';
import {formatMoney} from '@/lib/rental-pricing.mjs';
import CurrencyEquivalent from '@/components/CurrencyEquivalent';
import ActionDialog,{type EditorAction} from './ActionDialog';
type Api=(path:string,body?:BodyInit)=>Promise<string>;
export default function ServiceRateEditor({id,api,onDirtyChange}:{id:string;api:Api;onDirtyChange:(dirty:boolean)=>void}){
 const [rate,setRate]=useState<ServiceRate>();const [error,setError]=useState('');
 useEffect(()=>{let alive=true;api('commercial-admin').then(raw=>{if(alive)setRate((JSON.parse(raw) as CommercialCatalog).services.find(item=>item.id===id));}).catch(cause=>{if(alive)setError(cause.message);});return()=>{alive=false;};},[api,id]);
 if(!rate)return <p role="status">{error||'Cargando tarifas…'}</p>;
 return <RateForm key={JSON.stringify(rate)} rate={rate} api={api} onDirtyChange={onDirtyChange} onSaved={setRate}/>;
}
function RateForm({rate,api,onDirtyChange,onSaved}:{rate:ServiceRate;api:Api;onDirtyChange:(dirty:boolean)=>void;onSaved:(rate:ServiceRate)=>void}){
 const [price,setPrice]=useState(rate.cents==null?'':String(rate.cents/100));const [currency,setCurrency]=useState<Currency>(rate.currency??'PEN');
 const [unit,setUnit]=useState(rate.unit);const [mode,setMode]=useState(rate.secondaryMode??'tc');const [secondary,setSecondary]=useState(rate.secondary==null?'':String(rate.secondary/100));const [action,setAction]=useState<EditorAction>();const [message,setMessage]=useState('');
 const cents=price.trim()?Math.round(Number(price)*100):null;const other=secondary.trim()?Math.round(Number(secondary)*100):null;
 const dirty=cents!==rate.cents||currency!==(rate.currency??'PEN')||unit!==rate.unit||mode!==(rate.secondaryMode??'tc')||other!==(rate.secondary??null);
 useEffect(()=>onDirtyChange(dirty),[dirty,onDirtyChange]);
 return <><form onSubmit={event=>{event.preventDefault();if(mode==='manual'&&cents!==null&&other===null){setMessage('Complete el precio en la segunda moneda.');return;}setAction({title:'¿Guardar tarifa del servicio?',detail:'El precio aparecerá en su tarjeta y página. Dejarlo vacío muestra «Por consultar».',label:'Guardar tarifa',apply:async()=>{
 const next={id:rate.id,cents,currency,unit,secondary:other,secondaryMode:mode as 'manual'|'tc'};await api('service-rate',JSON.stringify(next));onSaved(next);window.dispatchEvent(new Event('marketing-saved'));
 }});}}><section><h2>Precio del servicio</h2><p>Puede publicar un importe desde por hora, día, mes, viaje u otra unidad. Incluya IGV. Deje el precio vacío si debe consultarse.</p><div className="rate-admin-grid">
 <label>Precio principal<input type="number" min="0.01" max="1000000" step="0.01" value={price} onChange={event=>setPrice(event.target.value)}/></label>
 <label>Moneda<select aria-label="Moneda" value={currency} onChange={event=>setCurrency(event.target.value as Currency)}><option value="PEN">Soles (S/)</option><option value="USD">Dólares (US$)</option></select></label>
 <label>Unidad de cobro<input required={cents!==null} maxLength={40} placeholder="hora, día, mes, viaje…" value={unit} onChange={event=>setUnit(event.target.value)}/></label>
 <label>Segundo precio<select aria-label="Segundo precio" value={mode} onChange={event=>setMode(event.target.value as 'tc'|'manual')}><option value="tc">Calcular con el TC</option><option value="manual">Digitar ambos precios</option></select></label>
 {mode==='manual'&&<label>Importe en {currency==='PEN'?'USD':'PEN'}<input type="number" min="0.01" max="1000000" step="0.01" value={secondary} onChange={event=>setSecondary(event.target.value)}/></label>}</div>
 {cents!==null&&Number.isFinite(cents)&&<div className="rental-price"><strong>{formatMoney(cents,currency)} / {unit||'unidad'}</strong><CurrencyEquivalent cents={cents} currency={currency} unit={unit} mode={mode} secondary={other}/></div>}
 <div className="actions"><button className="gold" disabled={!dirty}>Guardar tarifa</button><button type="button" disabled={!dirty} onClick={()=>{setPrice(rate.cents==null?'':String(rate.cents/100));setCurrency(rate.currency??'PEN');setUnit(rate.unit);setMode(rate.secondaryMode??'tc');setSecondary(rate.secondary==null?'':String(rate.secondary/100));}}>Descartar cambios</button></div>{message&&<p role="alert">{message}</p>}
 </section></form>{action&&<ActionDialog action={action} dismiss={()=>setAction(undefined)}/>}</>;
}
