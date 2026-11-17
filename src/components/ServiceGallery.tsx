'use client';
import {useMarketing} from './MarketingProvider';
import VehicleGallery from './VehicleGallery';
export default function ServiceGallery({id,hideEmpty=false}:{id:string;hideEmpty?:boolean}) {
  const service=useMarketing().servicePages.find(item=>item.id===id);
  if(!service)return null;
  const images=service.images.filter(image=>!image.reference);
  if(hideEmpty&&!images.length)return null;
  return <VehicleGallery key={images.map(photo=>photo.src).join('|')} name={service.name} images={images}/>;
}
