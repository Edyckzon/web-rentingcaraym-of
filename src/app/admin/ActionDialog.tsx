'use client';

import {useId, useLayoutEffect, useRef, useState} from 'react';
import {Check, LoaderCircle, Trash2, Undo2, X} from 'lucide-react';

export type EditorAction = {
  title: string;
  detail: string;
  label: string;
  tone?: 'save' | 'delete' | 'discard';
  photo?: string;
  apply: () => void | Promise<void>;
};

export default function ActionDialog({action, dismiss}: {action:EditorAction; dismiss:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  const cancel=useRef<HTMLButtonElement>(null);
  const locked=useRef(false);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const id=useId();
  const Icon=action.tone==='delete'?Trash2:action.tone==='discard'?Undo2:Check;
  useLayoutEffect(()=>{
    const dialog=ref.current!;
    const opener=document.activeElement;
    dialog.showModal();cancel.current?.focus();
    return ()=>{dialog.close();if(opener instanceof HTMLElement && opener.isConnected)opener.focus({preventScroll:true});};
  },[]);
  const close=()=>{if(!locked.current)dismiss();};
  async function submit(){
    if(locked.current)return;
    locked.current=true;setPending(true);setError('');
    try{await action.apply();dismiss();}
    catch(e){setError(e instanceof Error?e.message:'No se pudo completar la operación.');}
    finally{locked.current=false;setPending(false);}
  }
  return <dialog ref={ref} className={'editor-dialog '+(action.tone??'save')} aria-labelledby={id} aria-describedby={id+'-detail'}
    onCancel={e=>{e.preventDefault();close();}}>
    <div className="ed-head"><span className="ed-symbol"><Icon size={22}/></span>
      <button type="button" className="ed-close" disabled={pending} onClick={close} aria-label="Cerrar"><X size={18}/></button></div>
    <h2 id={id}>{action.title}</h2><p id={id+'-detail'}>{action.detail}</p>
    {action.photo&&<img className="ed-photo" src={action.photo} alt="Foto seleccionada"/>}
    {error&&<p role="alert" className="ed-error">{error}</p>}
    <div className="ed-actions"><button ref={cancel} type="button" disabled={pending} onClick={close}>Cancelar</button>
      <button type="button" className="ed-primary" disabled={pending} onClick={submit}>{pending&&<LoaderCircle size={16}/>}
        {pending?'Procesando…':action.label}</button></div>
  </dialog>;
}
