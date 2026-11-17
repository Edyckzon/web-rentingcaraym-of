import defaults from './navigation-defaults.json';
export type NavigationItem={id:string;parentId:string|null;label:string;href:string|null;position:number;visible:boolean};
export const defaultNavigation:NavigationItem[]=defaults;
export type MenuEntry={id:string;label:string;href:string;links?:never}|{id:string;label:string;href?:never;links:{label:string;href:string}[]};
export function menuEntries(items:NavigationItem[]):MenuEntry[]{
  const sorted=[...items].sort((a,b)=>a.position-b.position||a.id.localeCompare(b.id));
  return sorted.filter(item=>!item.parentId&&item.visible).flatMap<MenuEntry>(item=>{
    if(item.href)return [{id:item.id,label:item.label,href:item.href}];
    const links=sorted.filter(child=>child.parentId===item.id&&child.visible&&child.href).map(child=>({label:child.label,href:child.href!}));
    return links.length?[{id:item.id,label:item.label,links}]:[];
  });
}
