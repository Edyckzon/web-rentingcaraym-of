'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VehicleDetail from '@/components/VehicleDetail';
function Ficha(){return <VehicleDetail slug={useSearchParams().get('id')??''}/>;}
export default function Page(){return <Suspense><Ficha/></Suspense>;}
