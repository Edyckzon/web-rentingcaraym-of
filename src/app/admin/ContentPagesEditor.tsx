'use client';
import {useState} from 'react';
import BlockEditor from './BlockEditor';
import type {ContentBlock} from '@/lib/content-blocks';
export default function ContentPagesEditor({blocks,onSave,onDirtyChange,onBusyChange,initialGroup}:{blocks:ContentBlock[];onSave:(block:ContentBlock)=>Promise<void>;onDirtyChange:(dirty:boolean)=>void;onBusyChange:(busy:boolean)=>void;initialGroup?:string}){
 const groups=[...new Set(blocks.map(block=>block.group))];const [group,setGroup]=useState(initialGroup??groups[0]??'');const [dirty,setDirty]=useState(false);
 return <><p>Seleccione la sección de la web y el texto que desea mantener. Los encabezados e introducciones de las páginas también se encuentran en Páginas y SEO.</p><label>Sección de contenido<select aria-label="Sección de contenido" disabled={dirty} value={group} onChange={event=>setGroup(event.target.value)}>{groups.map(name=><option key={name}>{name}</option>)}</select></label>
 <BlockEditor key={group} blocks={blocks.filter(block=>block.group===group)} onSave={onSave} onBusyChange={onBusyChange} onDirtyChange={value=>{setDirty(value);onDirtyChange(value);}}/></>;
}
