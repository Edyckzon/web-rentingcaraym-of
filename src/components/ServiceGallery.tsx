'use client';
import {useMarketing} from './MarketingProvider';
import VehicleGallery from './VehicleGallery';
export default function ServiceGallery({id}:{id:string}) {
  const service=useMarketing().services.find(item=>item.id===id);
  if(!service)return null;
  const images=service.images.filter(image=>!image.reference);
  return <VehicleGallery key={images.map(photo=>photo.src).join('|')} name={service.name} images={images}/>;
}
