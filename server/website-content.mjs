const ids=['empresas','maquinaria-y-transporte','excavadora-cat-330dl','volquetes','transporte-de-carga'];
export const serviceContentFields={name:['nombre',100],equipment:['equipo',100],description:['descripcion',4000],message:['mensaje_whatsapp',2000],guidanceTitle:['guia_titulo',200],guidanceIntro:['guia_intro',1500],conditions:['condiciones',4000]};
export function mapServiceContent(row){return {id:row.id,...Object.fromEntries(Object.entries(serviceContentFields).map(([key,[column]])=>[key,row[column]])),applications:row.aplicaciones,quoteFields:row.datos_cotizacion};}
export function validateServiceContent(input,fail){
  if(!input||!ids.includes(input.id))fail(400,'Servicio no válido.');
  const patch={};
  for(const [key,[column,max]] of Object.entries(serviceContentFields)){
    if(typeof input[key]!=='string'||!input[key].trim()||input[key].length>max)fail(400,'Complete los textos del servicio dentro de los límites indicados.');
    patch[column]=input[key].trim();
  }
  for(const [key,column] of [['applications','aplicaciones'],['quoteFields','datos_cotizacion']]){
    if(!Array.isArray(input[key])||input[key].length>20||input[key].some(text=>typeof text!=='string'||!text.trim()||text.length>200))fail(400,'Use hasta 20 líneas de 200 caracteres por lista.');
    patch[column]=input[key].map(text=>text.trim());
  }
  return patch;
}
export function validateNavigation(input,fail,safeLink){
  if(!input||typeof input.id!=='string'||!/^[a-z0-9-]{1,100}$/.test(input.id)||typeof input.label!=='string'||!input.label.trim()||input.label.length>80
    ||!Number.isInteger(input.position)||input.position<0||input.position>10000||typeof input.visible!=='boolean'
    ||(input.parentId!==null&&(typeof input.parentId!=='string'||!/^[a-z0-9-]{1,100}$/.test(input.parentId)||input.parentId===input.id))
    ||(input.href!==null&&(!safeLink(input.href)||input.href.length>2048))||(!input.href&&input.parentId))fail(400,'Revise nombre, destino, grupo y orden del enlace.');
  if(input.href?.startsWith('https://')){
    let url;
    try{url=new URL(input.href);}catch{fail(400,'Indique una dirección https:// válida.');}
    if(!url.hostname||url.username||url.password)fail(400,'Indique una dirección https:// válida.');
  }
  return {id:input.id,etiqueta:input.label.trim(),destino:input.href,padre:input.parentId,orden:input.position,visible:input.visible};
}
