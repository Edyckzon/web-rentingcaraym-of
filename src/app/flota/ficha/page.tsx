import { Suspense } from 'react';
import VehicleLookup from '@/components/VehicleLookup';
export const metadata={title:'Ficha de vehículo',robots:{index:false,follow:true}};
export default function Page(){return <Suspense fallback={<p>Cargando ficha…</p>}><VehicleLookup/></Suspense>;}
